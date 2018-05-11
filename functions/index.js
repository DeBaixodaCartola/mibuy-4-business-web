const functions = require('firebase-functions');
const admin = require('firebase-admin');

const config = {
    projectId: 'projetocartolada',
    keyFilename: 'serviceAccountKey.json'
};  

// storage requirements
const gcs = require('@google-cloud/storage')(config);
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');
const exec = require('child_process').exec;
const url = require('url');
const request = require('request');

admin.initializeApp();

var bucket = admin.storage().bucket();

// start notification android function

exports.statusPedido = functions.database.ref('Empresas/{empresaId}/Pedidos/{pedidoId}').onUpdate((change, context) => {
    const snapshot = change.after; // pegando novo objeto escrito no banco

    const key = snapshot.key;
    var idApresentavel = key.slice(1, 5);

    // extraindo dados
    const idMercado = snapshot.val().idMercado;
    const idUsuario = snapshot.val().idUsuario;
    const statusPedido = snapshot.val().statusPedido; // armazena o status atual do pedido

    var payload; // armazena os dados que serao enviados para o cel

    if (statusPedido) {

        switch (statusPedido) {
            case 'cancelado':
                // envia notificacao status CANCELADO
                payload = {
    
                    data: {
                        title: 'Pedido cancelado',
                        body: 'O pedido ' + idApresentavel + ' foi cancelado, entre em contato com o mercado para saber mais',
                        icon: '/ic_notification.png',
                        sound: 'default'
                    }
            
                }
                break;
            case 'confirmado':
                // envia notificacao status CONFIRMADO
                payload = {
    
                    data: {
                        title: 'Pedido confirmado',
                        body: 'O pedido ' + idApresentavel + ' foi confirmado',
                        icon: '/ic_notification.png',
                        sound: 'default'
                    }
            
                }
                break;
            case 'pronto':
                // envia notificacao status EMPACOTADO
                payload = {
    
                    data: {
                        title: 'Pedido empacotado',
                        body: 'O pedido ' + idApresentavel + ' foi empacotado',
                        icon: '/ic_notification.png',
                        sound: 'default'
                    }
            
                }
                break;
            case 'retirado':
                // envia notificacao status RETIRADO
                payload = {
    
                    data: {
                    title: 'Pedido retirado',
                    body: 'O pedido ' + idApresentavel + ' foi retirado',
                    icon: '/ic_notification.png',
                    sound: 'default'
                    }
            
                }
                break;
            default:
                break;
        }
    
        var tokensAguardando = [] // array para os tokens 

        var token 

        // procurando usuario informado pelo porteiro
        // filtrando pelo nome completo do usuario
        admin.database().ref('UsuariosMiBuy/' + idUsuario).once('value', function (snap) {

            console.log(snap.val());
            // token user
            token = snap.val().token;
            tokensAguardando.push(token); // adicionando token ao array de tokens

            // enviando a notificacao, passando os tokens e a notificacao em si 
            return admin.messaging().sendToDevice(tokensAguardando, payload).then(response => {
                response.results.forEach((result, index) => {
                    const error = result.error
                    if (error) {
                        console.error('Algo deu errado', error)
                    } else {
                        console.log('Notificação statusPedido enviada com sucesso!')
                    }
                });
            });
        });
    } 

});

// end notification android function

// novo pedido notifcation

exports.novoPedido = functions.database.ref('Empresas/{empresaId}/Pedidos/{pedidoId}').onCreate((change, context) => {

    // extraindo dados
    const idMercado = change.val().idMercado;

    var payload = { // armazena os dados que serao enviados para o cel

        data: {
            title: 'Você tem um novo pedido',
            body: 'Toque e veja mais informações',
            icon: '/ic_notification.png',
            sound: 'default'
        }

    }

    var tokensAguardando = [] // array para os tokens 

    var token 

    // procurando usuario informado pelo porteiro
    // filtrando pelo nome completo do usuario
    admin.database().ref('Empresas/' + idMercado).once('value', function (snap) {

        console.log(snap.val());
        // token user
        token = snap.val().token;
        tokensAguardando.push(token); // adicionando token ao array de tokens

        // enviando a notificacao, passando os tokens e a notificacao em si 
        return admin.messaging().sendToDevice(tokensAguardando, payload).then(response => {
            response.results.forEach((result, index) => {
                const error = result.error
                if (error) {
                    console.error('Algo deu errado', error)
                } else {
                    console.log('Notificação statusPedido enviada com sucesso!')
                }
            });
        });
    });

});

// watermark function
exports.watermark = functions.storage.object().onFinalize((object, context) => {
    const fileBucket = object.bucket; // The Storage bucket that contains the file. 
    const filePath = object.name; // File path in the bucket.
    const contentType = object.contentType; // File content type.

    // Exit if this is triggered on a file that is not an image.
    if (!contentType.startsWith('image/')) {
        console.log('This is not an image.');
        return null;
    }
    
    // Get the file name.
    const fileName = path.basename(filePath);

    // Exit if the image is already a thumbnail.
    if (fileName.startsWith('wm_')) {
        console.log('Already edited.');
        return null;
    }

    // Exit if the image is gonna be marked as expired.
    if (fileName.startsWith('exp_') || fileName.startsWith('expC_')) {
        console.log('Editando imagem promo expirada');
        return null;
    }
    
    // Download file from bucket.
    const logo = bucket.file('ic_logo.png');
    const tempFilePath = path.join(os.tmpdir(), fileName);
    const tempEndPath = path.join(os.tmpdir(), fileName);
    const tempEnd2Path = path.join(os.tmpdir(), fileName);
    const tempLogoPath = path.join(os.tmpdir(), fileName+'logo');
    const metadata = {
        contentType: contentType,
    };
    logo.download({
      destination: tempLogoPath
    }, function(err) {
          console.log(err);
    });
    bucket.file(filePath).download({
      destination: tempEndPath
    }, function(err) {
          console.log(err);
    });
    bucket.file(filePath).download({
      destination: tempEnd2Path
    }, function(err) {
          console.log(err);
    });
    return bucket.file(filePath).download({
        destination: tempFilePath
    }).then(() => {
      console.log('Image downloaded locally to', tempFilePath, tempEndPath, tempLogoPath);
      // resize
      return spawn('convert', [tempFilePath, '-resize', '500x500', tempEnd2Path]);
    }).then(() => {
      // then watermark
      return spawn('convert', [tempEnd2Path, tempLogoPath, '-gravity', 'southeast', '-composite', tempEndPath]);
    }).then(() => {
      console.log('New image with watermark at', tempEndPath);
      const wmFileName = `wm_${fileName}`;
      const wmFilePath = path.join(path.dirname(filePath), wmFileName);
      // Uploading the image.

      return bucket.upload(tempEndPath, {
          destination: wmFilePath,
          metadata: metadata
      });

    // Once all is done delete the local file to free up disk space.
    }).then(() => {
        fs.unlinkSync(tempFilePath);
        fs.unlinkSync(tempLogoPath);
        fs.unlinkSync(tempEndPath);
    });
    
});

exports.metadataUpdated = functions.storage.object().onMetadataUpdate((object, context) => {
    console.log('This is a metadata change event.');

    console.log(object);

    // const url = customMetadata['url']; // Url from uploaded image metadata

    // if (url) {
    //     admin.database().ref('Feed').orderByChild('imagem').equalTo(url).on('value', (snapshot) => {
    //         snapshot.forEach((childSnapshot) => {
    //             const key = childSnapshot.key;

    //             // uploading url to the image with watermark
    //             gcs.bucket(fileBucket).file(`wm_${fileName}`).getSignedUrl({
    //                 action: 'read',
    //                 expires: '03-09-2495'
    //             }).then(wmUrl => {
    //                 console.log(`Url watermark ${wmUrl[0]}`);
    //                 admin.database().ref(`Feed/${key}/imagem`).set(wmUrl[0]);
    //             });
    //         });
    //     });
    // }

});

// expirada function
exports.PromoExpirada = functions.storage.object().onFinalize((object, context) => {
    const fileBucket = object.bucket; // The Storage bucket that contains the file. 
    const filePath = object.name; // File path in the bucket.
    const contentType = object.contentType; // File content type.

    // Exit if this is triggered on a file that is not an image.
    if (!contentType.startsWith('image/')) {
        console.log('This is not an image.');
        return null;
    }
    
    // Get the file name.
    const fileName = path.basename(filePath);

    if (fileName.startsWith('expC_')) {
        console.log('Imagem ja editada');
        return null;
    }

    // Exit if the image is already a thumbnail.
    if (fileName.startsWith('exp_')) {
    
        // Download file from bucket.
        const selo = bucket.file('selo_promo_expirada.png');
        const tempFilePath = path.join(os.tmpdir(), fileName);
        const tempSeloPath = path.join(os.tmpdir(), fileName + 'selo');
        const tempEndPath = path.join(os.tmpdir(), fileName);
        const metadata = {
            contentType: contentType,
        };
        selo.download({
            destination: tempSeloPath
        }, function(err) {
            console.log(err);
        });
        bucket.file(filePath).download({
            destination: tempEndPath
        }, function(err) {
            console.log(err);
        });
        return bucket.file(filePath).download({
            destination: tempFilePath
        }).then(() => {

        return spawn('convert', [tempFilePath, tempSeloPath, '-gravity', 'northwest', '-composite', tempEndPath]);

        }).then(() => {
        console.log('New image with selo at', tempEndPath);
        const wmFileName = `expC_${fileName}`;
        const wmFilePath = path.join(path.dirname(filePath), wmFileName);
        // Uploading the image.

        bucket.upload(tempEndPath, {
            destination: wmFilePath,
            metadata: metadata
        });

        console.log(filePath, 'caminho Arquivo');

        // retirar primeiras letras fileName
        imagem = fileName.substring(4, fileName.length);

        console.log(imagem);

        // uploading url to the image with selo expirada
        return gcs.bucket(fileBucket).file('wm_' + imagem).getSignedUrl({
            action: 'read',
            expires: '03-09-2495'
        }).then(wmUrl => {
            return admin.database().ref('Feed').orderByChild('imagem').equalTo(wmUrl[0]).on('value', snapshot => {
                snapshot.forEach(childSnapshot => {

                    const key = childSnapshot.key;

                    console.log(key);

                    // uploading url to the image with selo expirada
                    gcs.bucket(fileBucket).file(`expC_${fileName}`).getSignedUrl({
                        action: 'read',
                        expires: '03-09-2495'
                    }).then(expUrl => {
                        console.log(`Url Imagem para trocar nome imagem no realtime db ${expUrl[0]}`);
                        admin.database().ref('Feed/' + key + '/imagem').set(expUrl[0]);
                        admin.database().ref('Feed/' + key + '/nome_imagem').set(`expC_${imagem}`);
                    });

                })
            })
        });

        // Once all is done delete the local file to free up disk space.
        }).then(() => {
            fs.unlinkSync(tempFilePath);
            fs.unlinkSync(tempSeloPath);
            fs.unlinkSync(tempEndPath);
        });

    } else {
        console.log('This is not a promocao vencida');
        return null;
    }
    
});

//checkando se há promocoes vencidas
exports.checkValidade = functions.https.onRequest((req, res) => {
    //create database ref
    const dbRef = admin.database().ref('/Feed');
    //do a bunch of stuff
    
    //pegando data atual
    const date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    if (day < 10) {
        day = "0" + day;
    } 

    if (month < 10) {
        month = "0" + month;
    }

    console.log(day, month, year);

    dbRef.on('value', snapshot => {

        snapshot.forEach(childSnapshot => {
            const post = childSnapshot.val();
            const imagem = post.nomeImagem; //pegando nome imagem
            const vencPromo = post.data_promocao;

            const date = Date.now();

            var strChars = vencPromo.split("");
            const dayPromo = "" + strChars[0] + strChars[1];
            const monthPromo = "" + strChars[3] + strChars[4];
            const yearPromo = "" + strChars[6] + strChars[7] + strChars[8] + strChars[9];

            if (!imagem.startsWith('expC_')) {

                if (month == monthPromo) {

                    console.log(dayPromo, monthPromo, yearPromo);

                    if (day > dayPromo) {
                        console.log("Promo Vencida");

                        // const URL_TO_REQUEST = imageUrl;
                        // const uri = url.parse(URL_TO_REQUEST);
                        // const filename = path.basename(uri.path);

                        // const filepath = path.join(os.tmpdir(), filename);

                        // const metadata = {
                        //     contentType: 'image/png'
                        // };

                        // request(URL_TO_REQUEST)
                        // .pipe(fs.createWriteStream(filepath));

                        // const wmFileName = `wm_${filename}`;
                        // const wmFilePath = path.join(path.dirname(filepath), wmFileName);

                        const imagemRef = bucket.file('wm_' + imagem);
                        const tempFilePath = path.join(os.tmpdir(), 'wm_' + imagem);

                        return imagemRef.download({
                            destination: tempFilePath
                        }).then(() => {

                            const wmFileName = `exp_${imagem}`;
                            const wmFilePath = path.join(path.dirname('/'), wmFileName);
                            const metadataX = {
                                contentType: 'image/png'
                            };

                            // Uploading the image.
                            return bucket.upload(tempFilePath, {
                                destination: wmFilePath,
                                metadata: metadataX
                            });

                        // Once all is done delete the local file to free up disk space.
                        }).then(() => {
                            console.log('Image uploaded');
                            fs.unlinkSync(tempFilePath);
                        });

                    }
                } else if (month > monthPromo) {
                    const imagemRef = bucket.file('wm_' + imagem);
                    const tempFilePath = path.join(os.tmpdir(), 'wm_' + imagem);

                    return imagemRef.download({
                        destination: tempFilePath
                    }).then(() => {

                        const wmFileName = `exp_${imagem}`;
                        const wmFilePath = path.join(path.dirname('/'), wmFileName);
                        const metadataX = {
                            contentType: 'image/png'
                        };

                        // Uploading the image.
                        return bucket.upload(tempFilePath, {
                            destination: wmFilePath,
                            metadata: metadataX
                        });

                    // Once all is done delete the local file to free up disk space.
                    }).then(() => {
                        console.log('Image uploaded');
                        fs.unlinkSync(tempFilePath);
                    });
                }
            } else {
                console.log('imagem já foi editada')
            }
        })

    });

    //send back response 
    res.redirect(200);
});


