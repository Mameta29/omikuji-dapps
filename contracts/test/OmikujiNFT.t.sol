// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/OmikujiNFT.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockJPYC is IERC20 {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;

    function mint(address to, uint256 amount) public {
        _totalSupply += amount;
        _balances[to] += amount;
    }

    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }

    function transfer(
        address to,
        uint256 amount
    ) public override returns (bool) {
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function allowance(
        address owner,
        address spender
    ) public view override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(
        address spender,
        uint256 amount
    ) public override returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override returns (bool) {
        require(
            _allowances[from][msg.sender] >= amount,
            "Insufficient allowance"
        );
        _allowances[from][msg.sender] -= amount;
        _balances[from] -= amount;
        _balances[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}

contract OmikujiNFTTest is Test {
    OmikujiNFT public omikuji;
    MockJPYC public jpyc;
    address public owner;
    address public user;
    uint256 public constant PRICE = 100 * 10 ** 18; // 100 JPYC

    function setUp() public {
        owner = address(this);
        user = address(0x1);

        // Deploy mock JPYC
        jpyc = new MockJPYC();

        // Deploy Omikuji contract
        omikuji = new OmikujiNFT(address(jpyc));

        // Set fortune images
        string[] memory fortunes = new string[](5);
        fortunes[0] = unicode"大吉";
        fortunes[1] = unicode"中吉";
        fortunes[2] = unicode"小吉";
        fortunes[3] = unicode"末吉";
        fortunes[4] = unicode"凶";

        string[] memory imageUris = new string[](5);
        imageUris[
            0
        ] = "https://arweave.net/NRloglGyUQfRAN4IEnvdXUQqokAn3qKOEZQTCv3xUGk";
        imageUris[
            1
        ] = "https://arweave.net/aMckaIPIYFJgl9Vdv_wpdYB6EXCQYsmjjoFcvCLDJ8k";
        imageUris[
            2
        ] = "https://arweave.net/eeLZv8eaFqovZ2rwCD9P673ap-BeoROVT-tlN9_ptd8";
        imageUris[
            3
        ] = "https://arweave.net/pjKFk6dNt5BC-rckA8o8tdoMIUMYZtiAdEAw3SUsPe4";
        imageUris[
            4
        ] = "https://arweave.net/8_8_wgSVMQiwzrK3JD1IHTJmbOwo4cl9yK85XRlPJEQ";

        omikuji.setBatchFortuneImages(fortunes, imageUris);

        // Mint JPYC to user for testing
        jpyc.mint(user, 1000 * 10 ** 18); // 1000 JPYC
    }

    function testInitialState() public view {
        string[] memory availableFortunes = omikuji.getAvailableFortunes();
        assertEq(availableFortunes.length, 5, "Should have 5 fortunes");

        uint256[] memory probabilities = omikuji.getFortuneProbabilities();
        assertEq(probabilities.length, 5, "Should have 5 probabilities");

        // Check total probability is 100%
        uint256 totalProbability = 0;
        for (uint256 i = 0; i < probabilities.length; i++) {
            totalProbability += probabilities[i];
        }
        assertEq(totalProbability, 100, "Total probability should be 100");
    }

    function testFortuneImageURIs() public view {
        // 運勢の文字列を直接指定
        string[] memory testFortunes = new string[](5);
        testFortunes[0] = unicode"大吉";
        testFortunes[1] = unicode"中吉";
        testFortunes[2] = unicode"小吉";
        testFortunes[3] = unicode"末吉";
        testFortunes[4] = unicode"凶";

        // 各運勢の画像URIを確認
        for (uint256 i = 0; i < testFortunes.length; i++) {
            string memory imageUri = omikuji.getFortuneImageUri(
                testFortunes[i]
            );
            assertTrue(
                bytes(imageUri).length > 0,
                string.concat("Image URI not set for ", testFortunes[i])
            );
        }
    }

    function testDrawOmikuji() public {
        vm.startPrank(user);

        // Approve JPYC spending
        jpyc.approve(address(omikuji), PRICE);

        // Draw omikuji
        uint256 tokenId = omikuji.drawOmikuji();

        // Check token ownership
        assertEq(omikuji.ownerOf(tokenId), user);

        // Check JPYC transfer
        assertEq(jpyc.balanceOf(address(omikuji)), PRICE);

        vm.stopPrank();
    }

    function testTokenURI() public {
        vm.startPrank(user);
        jpyc.approve(address(omikuji), PRICE);
        uint256 tokenId = omikuji.drawOmikuji();

        string memory uri = omikuji.tokenURI(tokenId);
        assertTrue(bytes(uri).length > 0, "Token URI should not be empty");

        vm.stopPrank();
    }

    function testPause() public {
        // Test pause functionality
        omikuji.pause();
        assertTrue(omikuji.paused(), "Contract should be paused");

        vm.startPrank(user);
        jpyc.approve(address(omikuji), PRICE);

        // Expect revert when drawing while paused
        vm.expectRevert();
        omikuji.drawOmikuji();

        vm.stopPrank();

        // Test unpause
        omikuji.unpause();
        assertFalse(omikuji.paused(), "Contract should be unpaused");
    }

    function testWithdrawJPYC() public {
        // First draw an omikuji to get some JPYC in the contract
        vm.startPrank(user);
        jpyc.approve(address(omikuji), PRICE);
        omikuji.drawOmikuji();
        vm.stopPrank();

        // Test partial withdrawal
        uint256 withdrawAmount = PRICE / 2;
        uint256 initialBalance = jpyc.balanceOf(address(this));
        omikuji.withdrawJPYC(withdrawAmount);
        assertEq(
            jpyc.balanceOf(address(this)),
            initialBalance + withdrawAmount,
            "Withdrawal amount incorrect"
        );

        // Test withdraw all
        omikuji.withdrawAllJPYC();
        assertEq(
            jpyc.balanceOf(address(omikuji)),
            0,
            "Contract should have no JPYC after withdrawAll"
        );
    }

    function testFailDrawWithoutApproval() public {
        vm.prank(user);
        omikuji.drawOmikuji(); // Should fail because JPYC not approved
    }

    function testFailDrawWithInsufficientBalance() public {
        // Burn all JPYC from user
        vm.startPrank(user);
        uint256 balance = jpyc.balanceOf(user);
        jpyc.transfer(address(0xdead), balance);

        jpyc.approve(address(omikuji), PRICE);
        vm.expectRevert("ERC20: transfer amount exceeds balance");
        omikuji.drawOmikuji();

        vm.stopPrank();
    }
}
