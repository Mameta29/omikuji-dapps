// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract OmikujiNFT is ERC721, ReentrancyGuard, Pausable, Ownable {
    using Strings for uint256;

    uint256 private _currentTokenId;
    IERC20 public jpycToken;
    uint256 public constant PRICE = 100 * 10 ** 18; // 100 JPYC (considering 18 decimals)

    struct OmikujiResult {
        string fortune;
        string imageUri; // 画像のArweave URI
    }

    mapping(uint256 => OmikujiResult) public omikujiResults;
    mapping(string => string) public fortuneToImageUri; // 運勢から画像URIへのマッピング

    event JPYCWithdrawn(address indexed owner, uint256 amount);
    event OmikujiDrawn(
        address indexed player,
        uint256 indexed tokenId,
        string fortune
    );
    event FortuneImageUpdated(string fortune, string imageUri);

    string[] private fortunes = [
        unicode"大吉",
        unicode"中吉",
        unicode"小吉",
        unicode"末吉",
        unicode"凶"
    ];

    uint256[] private probabilities = [10, 20, 30, 25, 15]; // 確率（%）

    constructor(
        address _jpycToken
    ) ERC721("Omikuji Fortune", "OMIKUJI") Ownable(msg.sender) {
        require(_jpycToken != address(0), "Invalid JPYC token address");
        jpycToken = IERC20(_jpycToken);

        // 確率の合計が100%になることを確認
        uint256 totalProbability = 0;
        for (uint256 i = 0; i < probabilities.length; i++) {
            totalProbability += probabilities[i];
        }
        require(totalProbability == 100, "Total probability must be 100");
    }

    // おみくじを引く
    function drawOmikuji()
        external
        nonReentrant
        whenNotPaused
        returns (uint256)
    {
        require(
            jpycToken.transferFrom(msg.sender, address(this), PRICE),
            "JPYC transfer failed"
        );

        uint256 newTokenId = ++_currentTokenId;
        string memory fortune = _getRandomFortune();
        string memory imageUri = fortuneToImageUri[fortune];

        require(bytes(imageUri).length > 0, "Image URI not set for fortune");

        omikujiResults[newTokenId] = OmikujiResult(fortune, imageUri);
        _safeMint(msg.sender, newTokenId);

        emit OmikujiDrawn(msg.sender, newTokenId, fortune);
        return newTokenId;
    }

    // 運勢の画像URIを設定
    function setFortuneImage(
        string calldata fortune,
        string calldata imageUri
    ) external onlyOwner {
        require(bytes(imageUri).length > 0, "Invalid image URI");
        fortuneToImageUri[fortune] = imageUri;
        emit FortuneImageUpdated(fortune, imageUri);
    }

    // 複数の運勢の画像URIを一括設定
    function setBatchFortuneImages(
        string[] calldata _fortunes,
        string[] calldata imageUris
    ) external onlyOwner {
        require(_fortunes.length == imageUris.length, "Array length mismatch");
        for (uint256 i = 0; i < _fortunes.length; i++) {
            require(bytes(imageUris[i]).length > 0, "Invalid image URI");
            fortuneToImageUri[_fortunes[i]] = imageUris[i];
            emit FortuneImageUpdated(_fortunes[i], imageUris[i]);
        }
    }

    // トークンURIの取得（オンチェーンメタデータ）
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        _requireOwned(tokenId);
        OmikujiResult memory result = omikujiResults[tokenId];
        require(bytes(result.fortune).length > 0, "Token metadata not found");

        // JSONメタデータの構築
        string memory json = string(
            abi.encodePacked(
                '{"name": "Omikuji #',
                tokenId.toString(),
                '", "description": "',
                unicode"新年のおみくじ NFT - ",
                result.fortune,
                '", "image": "',
                result.imageUri,
                '", "attributes": [{"trait_type": "Fortune", "value": "',
                result.fortune,
                '"}]}'
            )
        );

        // Base64でエンコード
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(bytes(json))
                )
            );
    }

    // JPYCの引き出し
    function withdrawJPYC(uint256 amount) external onlyOwner {
        uint256 balance = jpycToken.balanceOf(address(this));
        require(balance >= amount, "Insufficient balance");
        require(jpycToken.transfer(msg.sender, amount), "Transfer failed");
        emit JPYCWithdrawn(msg.sender, amount);
    }

    // すべてのJPYCを引き出し
    function withdrawAllJPYC() external onlyOwner {
        uint256 balance = jpycToken.balanceOf(address(this));
        require(balance > 0, "No balance to withdraw");
        require(jpycToken.transfer(msg.sender, balance), "Transfer failed");
        emit JPYCWithdrawn(msg.sender, balance);
    }

    // コントラクトの一時停止
    function pause() external onlyOwner {
        _pause();
    }

    // コントラクトの再開
    function unpause() external onlyOwner {
        _unpause();
    }

    // ランダムな運勢を取得
    function _getRandomFortune() private view returns (string memory) {
        uint256 rand = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    msg.sender,
                    _currentTokenId
                )
            )
        ) % 100;

        uint256 cumulative = 0;
        for (uint256 i = 0; i < probabilities.length; i++) {
            cumulative += probabilities[i];
            if (rand < cumulative) {
                return fortunes[i];
            }
        }
        return fortunes[fortunes.length - 1];
    }

    // 利用可能な運勢の一覧を取得
    function getAvailableFortunes() external view returns (string[] memory) {
        return fortunes;
    }

    // 運勢の確率を取得
    function getFortuneProbabilities()
        external
        view
        returns (uint256[] memory)
    {
        return probabilities;
    }

    // 特定の運勢の画像URIを取得
    function getFortuneImageUri(
        string calldata fortune
    ) external view returns (string memory) {
        return fortuneToImageUri[fortune];
    }
}
