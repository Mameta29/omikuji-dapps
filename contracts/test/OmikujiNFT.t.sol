// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/OmikujiNFT.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockJPYC is ERC20 {
    constructor() ERC20("Mock JPYC", "JPYC") {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }
}

contract OmikujiNFTTest is Test {
    OmikujiNFT public omikuji;
    MockJPYC public jpyc;
    address public user = address(1);
    uint256 public constant PRICE = 100 * 10 ** 18;

    function setUp() public {
        // Mock JPYCのデプロイ
        jpyc = new MockJPYC();

        // おみくじコントラクトのデプロイ
        omikuji = new OmikujiNFT(address(jpyc));

        // テストユーザーにJPYCを転送
        jpyc.transfer(user, 1000 * 10 ** 18);

        // テストユーザーとしての操作を開始
        vm.startPrank(user);
    }

    function testDrawOmikuji() public {
        // JPYCの承認
        jpyc.approve(address(omikuji), PRICE);

        // おみくじを引く前のJPYC残高を記録
        uint256 balanceBefore = jpyc.balanceOf(user);

        // おみくじを引く
        uint256 tokenId = omikuji.drawOmikuji();

        // JPYC残高の確認
        assertEq(
            jpyc.balanceOf(user),
            balanceBefore - PRICE,
            "Incorrect JPYC balance after drawing"
        );

        // NFTの所有権確認
        assertEq(
            omikuji.ownerOf(tokenId),
            user,
            "NFT not minted to correct owner"
        );

        // おみくじ結果の取得と確認
        (string memory fortune, string memory imageURI) = omikuji
            .omikujiResults(tokenId);
        assertTrue(bytes(fortune).length > 0, "Fortune should not be empty");
        assertTrue(bytes(imageURI).length > 0, "Image URI should not be empty");
    }

    function testFailDrawWithoutApproval() public {
        // 承認なしでおみくじを引こうとする
        omikuji.drawOmikuji();
    }

    function testFailDrawWithInsufficientBalance() public {
        // JPYCの承認
        jpyc.approve(address(omikuji), PRICE);

        // ユーザーのJPYC残高をゼロにする
        uint256 balance = jpyc.balanceOf(user);
        jpyc.transfer(address(0x2), balance);

        // 残高不足でおみくじを引こうとする
        omikuji.drawOmikuji();
    }

    function testTokenURI() public {
        // JPYCの承認
        jpyc.approve(address(omikuji), PRICE);

        // おみくじを引く
        uint256 tokenId = omikuji.drawOmikuji();

        // TokenURIの取得と確認
        string memory uri = omikuji.tokenURI(tokenId);
        assertTrue(bytes(uri).length > 0, "Token URI should not be empty");
        assertTrue(
            bytes(uri).length > 20 &&
                keccak256(bytes(uri[0:20])) ==
                keccak256(bytes("data:application/json")),
            "Token URI should be in correct format"
        );
    }

    function testMultipleDraws() public {
        // JPYCの承認
        jpyc.approve(address(omikuji), PRICE * 3);

        // 複数回おみくじを引く
        uint256[] memory tokenIds = new uint256[](3);
        for (uint256 i = 0; i < 3; i++) {
            tokenIds[i] = omikuji.drawOmikuji();
        }

        // 各トークンの所有権を確認
        for (uint256 i = 0; i < 3; i++) {
            assertEq(
                omikuji.ownerOf(tokenIds[i]),
                user,
                "NFT not minted to correct owner"
            );
        }
    }

    function testRandomDistribution() public {
        // JPYCの承認
        jpyc.approve(address(omikuji), PRICE * 100);

        // 100回おみくじを引いて分布を確認
        uint256 daikichi = 0;
        uint256 chukichi = 0;
        uint256 shokichi = 0;
        uint256 kichi = 0;
        uint256 suekichi = 0;

        for (uint256 i = 0; i < 100; i++) {
            uint256 tokenId = omikuji.drawOmikuji();
            (string memory fortune, ) = omikuji.omikujiResults(tokenId);

            if (keccak256(bytes(fortune)) == keccak256(bytes("大吉")))
                daikichi++;
            else if (keccak256(bytes(fortune)) == keccak256(bytes("中吉")))
                chukichi++;
            else if (keccak256(bytes(fortune)) == keccak256(bytes("小吉")))
                shokichi++;
            else if (keccak256(bytes(fortune)) == keccak256(bytes("吉")))
                kichi++;
            else if (keccak256(bytes(fortune)) == keccak256(bytes("末吉")))
                suekichi++;
        }

        // おおよその確率分布を確認（完全なランダム性により多少の変動は許容）
        assertTrue(
            daikichi > 5 && daikichi < 15,
            "Daikichi probability out of expected range"
        );
        assertTrue(
            chukichi > 15 && chukichi < 25,
            "Chukichi probability out of expected range"
        );
        assertTrue(
            shokichi > 25 && shokichi < 35,
            "Shokichi probability out of expected range"
        );
        assertTrue(
            kichi > 20 && kichi < 30,
            "Kichi probability out of expected range"
        );
        assertTrue(
            suekichi > 10 && suekichi < 20,
            "Suekichi probability out of expected range"
        );
    }
}
