// arweave/upload.ts
import Arweave from 'arweave';
import * as fs from 'fs';
import * as path from 'path';

const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
});

async function uploadToArweave(wallet: any) {
    const fortunes = ['大吉', '中吉', '小吉', '吉', '末吉'];
    const uploadedIds: Record<string, string> = {};

    for (const fortune of fortunes) {
        // イメージディレクトリからの相対パス
        const imagePath = path.join(__dirname, `images/${fortune}.png`);
        const imageData = fs.readFileSync(imagePath);
        
        console.log(`Uploading ${fortune} image...`);
        const transaction = await arweave.createTransaction({
            data: imageData
        }, wallet);

        transaction.addTag('Content-Type', 'image/png');
        transaction.addTag('Type', 'omikuji-image');
        transaction.addTag('Fortune', fortune);

        await arweave.transactions.sign(transaction, wallet);
        const response = await arweave.transactions.post(transaction);
        
        if (response.status === 200 || response.status === 208) {
            uploadedIds[fortune] = transaction.id;
            console.log(`Image uploaded successfully. Transaction ID: ${transaction.id}`);
            
            // メタデータの作成とアップロード
            console.log(`Creating metadata for ${fortune}...`);
            const metadata = {
                name: `Omikuji Fortune - ${fortune}`,
                description: `This is a ${fortune} fortune from the Omikuji NFT collection`,
                image: `ar://${transaction.id}`,
                attributes: [
                    {
                        trait_type: "Fortune",
                        value: fortune
                    }
                ]
            };

            const metadataTransaction = await arweave.createTransaction({
                data: JSON.stringify(metadata)
            }, wallet);

            metadataTransaction.addTag('Content-Type', 'application/json');
            metadataTransaction.addTag('Type', 'omikuji-metadata');
            metadataTransaction.addTag('Fortune', fortune);

            await arweave.transactions.sign(metadataTransaction, wallet);
            const metadataResponse = await arweave.transactions.post(metadataTransaction);
            
            if (metadataResponse.status === 200 || metadataResponse.status === 208) {
                console.log(`Metadata uploaded successfully. Transaction ID: ${metadataTransaction.id}`);
                console.log('----------------------------------------');
            }
        }
    }

    // コントラクトの設定用にフォーマットされた出力
    console.log('\nContract setup commands:');
    Object.entries(uploadedIds).forEach(([fortune, id]) => {
        console.log(`await contract.setFortuneMetadata("${fortune}", "${id}");`);
    });

    return uploadedIds;
}

async function main() {
    try {
        console.log('Loading wallet...');
        const wallet = JSON.parse(fs.readFileSync(
            path.join(__dirname, 'wallet.json'),
            'utf-8'
        ));
        
        console.log('Starting upload process...');
        await uploadToArweave(wallet);
        
    } catch (error) {
        console.error('Error occurred:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

export { uploadToArweave };