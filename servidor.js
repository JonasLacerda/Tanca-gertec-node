const fs = require('fs');
const net = require('net');

const terminais = [];

const server = net.createServer((socket) => {
    const terminalAddress = socket.remoteAddress;
    console.log(`Terminal ${terminalAddress} conectado`);

    terminais.push(socket);

    socket.on('data', (data) => {
        const comandoRecebido = data.toString().trim();

        // Verifica se recebeu leitura de código de barras
        if (comandoRecebido.startsWith('#')) {
            console.log(comandoRecebido.substring(1));
            const cod = comandoRecebido.substring(1);

            // Lê o arquivo CSV e procura pelo código de barras
            fs.readFile('PRICETAB.TXT', 'utf8', (err, data) => {
                if (err) {
                    console.error('Erro ao ler o arquivo CSV: ' + err);
                    socket.write('Erro ao consultar o código de barras');
                    return;
                }

                const linhas = data.split('\n');
                let encontrado = false;
                let resposta = '';

                // Itera sobre as linhas do arquivo CSV
                for (const linha of linhas) {
                    const [codigo, descricao, preco, cod2] = linha.split('|');
                    if (codigo === cod) {
                        resposta = `#${descricao}|${preco}|${cod2}`;
                        encontrado = true;
                        break;
                    }
                }

                if (!encontrado) {
                    console.log('Código de barras não encontrado');
                    resposta = '#Código de barras não encontrado|0.00|0';
                }

                // Envia a resposta para o terminal
                socket.write(resposta);
            });
        }
        // Outras verificações de comandos podem ser adicionadas aqui
        // ...
    });

    socket.on('end', () => {
        console.log('Terminal desconectado');
        const index = terminais.indexOf(socket);
        if (index !== -1) {
            terminais.splice(index, 1);
        }
    });

    socket.on('error', (err) => {
        console.error('Erro: ' + err.message);
    });
});

const PORT = 6500;

server.listen(PORT, () => {
    console.log(`Servidor escutando na porta ${PORT}`);
});
