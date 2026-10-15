import torch
import torch.nn as nn
import torch.nn.functional as F


class NumericalFeatureTokenizer(nn.Module):
    def __init__(self, num_features: int, d_model: int):
        super().__init__()
        self.num_features = num_features
        self.d_model = d_model

        self.weight = nn.Parameter(
            torch.randn(num_features, d_model) * 0.02
        )
        self.bias = nn.Parameter(
            torch.zeros(num_features, d_model)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: (batch, num_features)
        x = x.unsqueeze(-1)
        # output: (batch, num_features, d_model)
        return x * self.weight + self.bias


class FeatureIdentityEmbedding(nn.Module):
    def __init__(self, num_features: int, d_model: int):
        super().__init__()
        self.embedding = nn.Parameter(
            torch.randn(1, num_features, d_model) * 0.02
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return x + self.embedding


class ConformerConvModule(nn.Module):
    def __init__(self, d_model: int, kernel_size: int = 3, dropout: float = 0.1):
        super().__init__()
        self.norm = nn.LayerNorm(d_model)
        self.pointwise_in = nn.Conv1d(
            d_model,
            2 * d_model,
            kernel_size=1,
        )
        self.depthwise = nn.Conv1d(
            d_model,
            d_model,
            kernel_size=kernel_size,
            padding=kernel_size // 2,
            groups=d_model,
        )
        self.activation = nn.SiLU()
        self.pointwise_out = nn.Conv1d(
            d_model,
            d_model,
            kernel_size=1,
        )
        self.dropout = nn.Dropout(dropout)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: (batch, sequence, d_model)
        x = self.norm(x)
        x = x.transpose(1, 2)

        x = self.pointwise_in(x)
        x = F.glu(x, dim=1)

        x = self.depthwise(x)
        x = self.activation(x)

        x = self.pointwise_out(x)
        x = self.dropout(x)

        return x.transpose(1, 2)


class FeedForwardModule(nn.Module):
    def __init__(self, d_model: int, ffn_dim: int, dropout: float = 0.1):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(d_model, ffn_dim),
            nn.SiLU(),
            nn.Dropout(dropout),
            nn.Linear(ffn_dim, d_model),
            nn.Dropout(dropout),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


class ConformerBlock(nn.Module):
    def __init__(
        self,
        d_model: int,
        num_heads: int,
        ffn_dim: int,
        conv_kernel_size: int = 3,
        dropout: float = 0.1,
    ):
        super().__init__()

        # Macaron-style FFN 1
        self.ffn1_norm = nn.LayerNorm(d_model)
        self.ffn1 = FeedForwardModule(d_model, ffn_dim, dropout)

        # Self-attention
        self.attn_norm = nn.LayerNorm(d_model)
        self.attention = nn.MultiheadAttention(
            embed_dim=d_model,
            num_heads=num_heads,
            dropout=dropout,
            batch_first=True,
        )
        self.attn_dropout = nn.Dropout(dropout)

        # Convolution
        self.conv = ConformerConvModule(
            d_model=d_model,
            kernel_size=conv_kernel_size,
            dropout=dropout,
        )

        # Macaron-style FFN 2
        self.ffn2_norm = nn.LayerNorm(d_model)
        self.ffn2 = FeedForwardModule(d_model, ffn_dim, dropout)

        self.final_norm = nn.LayerNorm(d_model)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # FFN 1
        x = x + 0.5 * self.ffn1(self.ffn1_norm(x))

        # Multi-head self-attention
        residual = x
        z = self.attn_norm(x)
        attn_out, _ = self.attention(z, z, z, need_weights=False)
        x = residual + self.attn_dropout(attn_out)

        # Convolution
        x = x + self.conv(x)

        # FFN 2
        x = x + 0.5 * self.ffn2(self.ffn2_norm(x))

        return self.final_norm(x)


class TabularConformer(nn.Module):
    def __init__(
        self,
        num_features: int,
        num_classes: int = 4,
        d_model: int = 64,
        num_heads: int = 4,
        num_layers: int = 2,
        ffn_dim: int = 128,
        conv_kernel_size: int = 3,
        dropout: float = 0.1,
    ):
        super().__init__()

        self.tokenizer = NumericalFeatureTokenizer(num_features, d_model)
        self.feature_identity = FeatureIdentityEmbedding(num_features, d_model)
        self.input_norm = nn.LayerNorm(d_model)

        self.blocks = nn.ModuleList([
            ConformerBlock(
                d_model=d_model,
                num_heads=num_heads,
                ffn_dim=ffn_dim,
                conv_kernel_size=conv_kernel_size,
                dropout=dropout,
            )
            for _ in range(num_layers)
        ])

        self.output_norm = nn.LayerNorm(d_model)

        self.classifier = nn.Sequential(
            nn.Linear(d_model, d_model),
            nn.SiLU(),
            nn.Dropout(dropout),
            nn.Linear(d_model, num_classes),
        )

    def forward(self, x: torch.Tensor, return_features: bool = False):
        x = self.tokenizer(x)
        x = self.feature_identity(x)
        x = self.input_norm(x)

        for block in self.blocks:
            x = block(x)

        x = self.output_norm(x)

        # Mean pooling across feature tokens
        representation = x.mean(dim=1)
        logits = self.classifier(representation)

        if return_features:
            return {
                "logits": logits,
                "representation": representation,
                "feature_tokens": x,
            }

        return logits
