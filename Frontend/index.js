// in front-end js we can't use "require"
// but we can use "import"
import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

// add buttons here insted in html file
const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
    if (typeof window.ethereum !== undefined) {
        await ethereum.request({ method: "eth_requestAccounts" })
        document.getElementById("connectButton").innerHTML = "Connected"
    } else {
        console.log("No wallet is there")
    }
}

// async function fund() {
// 	const ethAmount = "33"
// 	console.log("Im here")
// 	console.log("Funding with ", ethAmount)
// 	if (typeof window.ethereum !== undefined) {
// 		// The things which are necessary for transaction
// 		// 1. provider
// 		const provider = new ethers.providers.Web3Provider(window.ethereum)

// 		// 2. signer
// 		const signer = provider.getSigner()

// 		console.log(signer)

// 		// 3. connection with blockchain by running hardhat node in other terminal where you backend is

// 		// 4. abi and contract address(from the node which you are running in backend)
// 		const contract = new ethers.Contract(contractAddress, abi, signer)

// 		// do the transaction and get the response
// 		const transactionResponse = await contract.fund({ value: ethers.utils.parseEther(ethAmount) })
// 	}
// }

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            // wait trasaction to finish
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done")
        } catch (error) {
            console.log(error)
        }
    } else {
        fundButton.innerHTML = "Please install MetaMask"
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    return new Promise((resolve, reject) => {
        console.log(`Mining ${transactionResponse.hash}...`)
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(`Completed with ${transactionReceipt.confirmations} confirmations`)
            resolve()
        })
    })
}

async function getBalance() {
    if (window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

async function withdraw() {
    if (window.ethereum !== "undefined") {
        console.log("Withdrawing...")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}
