// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OmikujiNFT is ERC721, ReentrancyGuard {
    // using Counters for Counters.Counter;
    // Counters.Counter private _tokenIds;

    uint256 private _nextTokenId;

    IERC20 public jpycToken;
    uint256 public constant PRICE = 100 * 10 ** 18; // 100 JPYC (considering 18 decimals)

    // おみくじの結果を格納する構造体
    struct OmikujiResult {
        string fortune; // 運勢（大吉、中吉など）
        string imageURI; // NFTのイメージURI
    }

    // トークンIDからおみくじ結果へのマッピング
    mapping(uint256 => OmikujiResult) public omikujiResults;

    // 運勢の種類と確率の設定
    string[] private fortunes = [
        unicode"大吉",
        unicode"中吉",
        unicode"小吉",
        unicode"吉",
        unicode"末吉"
    ];
    uint256[] private probabilities = [10, 20, 30, 25, 15]; // 確率（%）

    event OmikujiDrawn(address indexed player, uint256 tokenId, string fortune);

    constructor(address _jpycToken) ERC721("Omikuji Fortune", "OMIKUJI") {
        jpycToken = IERC20(_jpycToken);
    }

    // おみくじを引く関数
    function drawOmikuji() external nonReentrant returns (uint256) {
        require(
            jpycToken.transferFrom(msg.sender, address(this), PRICE),
            "JPYC transfer failed"
        );

        // _tokenIds.increment();
        // uint256 newTokenId = _tokenIds.current();
        uint256 newTokenId = _nextTokenId++;

        // ランダムな運勢を決定
        string memory fortune = _getRandomFortune();
        string memory imageURI = _getImageURIForFortune(fortune);

        omikujiResults[newTokenId] = OmikujiResult(fortune, imageURI);
        _safeMint(msg.sender, newTokenId);

        emit OmikujiDrawn(msg.sender, newTokenId, fortune);
        return newTokenId;
    }

    // ランダムな運勢を取得する内部関数
    function _getRandomFortune() private view returns (string memory) {
        uint256 rand = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    msg.sender,
                    _tokenIds.current()
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

    // 運勢に応じたイメージURIを取得する関数
    function _getImageURIForFortune(
        string memory fortune
    ) private pure returns (string memory) {
        // ArweaveのURIを返す実装をここに追加
        // 実際のデプロイ時にはArweaveにアップロードした画像のURIを返すように実装
        return string(abi.encodePacked("ar://", fortune));
    }

    // トークンURIを取得する関数
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        OmikujiResult memory result = omikujiResults[tokenId];

        // JSON形式のメタデータを返す
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            string(
                                abi.encodePacked(
                                    '{"name": "Omikuji #',
                                    toString(tokenId),
                                    '", "description": "Japanese Fortune NFT", "fortune": "',
                                    result.fortune,
                                    '", "image": "',
                                    result.imageURI,
                                    '"}'
                                )
                            )
                        )
                    )
                )
            );
    }

    // 数値を文字列に変換するヘルパー関数
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}

// Base64エンコーディングライブラリ
library Base64 {
    string internal constant TABLE =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    function encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";

        uint256 len = 4 * ((data.length + 2) / 3);
        bytes memory result = new bytes(len + 32);

        bytes memory table = bytes(TABLE);
        uint256 i;
        uint256 j;

        for (i = 0; i + 3 <= data.length; i += 3) {
            (uint256 a, uint256 b, uint256 c) = ((uint256(uint8(data[i])) <<
                16) |
                (uint256(uint8(data[i + 1])) << 8) |
                uint256(uint8(data[i + 2])));

            result[j] = table[a >> 18];
            result[j + 1] = table[(a >> 12) & 0x3F];
            result[j + 2] = table[(a >> 6) & 0x3F];
            result[j + 3] = table[a & 0x3F];

            j += 4;
        }

        if (i < data.length) {
            uint256 a = uint256(uint8(data[i])) << 16;
            if (i + 1 < data.length) a |= uint256(uint8(data[i + 1])) << 8;

            result[j] = table[a >> 18];
            result[j + 1] = table[(a >> 12) & 0x3F];
            result[j + 2] = (i + 1 < data.length)
                ? table[(a >> 6) & 0x3F]
                : bytes1("=");
            result[j + 3] = "=";
        }

        return string(result);
    }
}
