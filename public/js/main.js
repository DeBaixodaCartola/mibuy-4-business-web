// Initialize Firebase
var config = {
    apiKey: "AIzaSyAh1_rHkp6py_uMZdn7yiJFYOlO3c0HNhA",
    authDomain: "projetocartolada.firebaseapp.com",
    databaseURL: "https://projetocartolada.firebaseio.com",
    projectId: "projetocartolada",
    storageBucket: "projetocartolada.appspot.com",
    messagingSenderId: "477812496466"
  };
firebase.initializeApp(config);

$(document).ready(function() {

    var mibuy = 'mibuy';
    var mibuyId = document.getElementById('write_mibuy');

    escrever(mibuy, mibuyId);   
   
}) 

// referencia svg timeline etapas pedido
function refSvgElements(id) {
    return document.getElementById(id);
}

// manipulação

// line_confirmacao.style.stroke = "#fff";
// circle_confirmacao.style.fill = "#fff";

//funcao efeito escrever palavra pausadamente
function escrever(str, el) {
    var char = str.split('').reverse();
    var typer = setInterval(function() {
        if (!char.length) return clearInterval(typer);
        var next = char.pop();
        el.innerHTML += next;
    }, 150);
} 

// variaveis tempo
var dia, mes, horas, minutos;

// variavel é primeiro item (p/ mostrar infobox ID)
var primeiroItem;

// funcao add 0 em tempo < 10
function addZero(tempo, tipo) {
    if (tempo < 10) {
        tempo = '0' + tempo;
    }

    switch(tipo) {
        case 'dia':
            return dia = tempo;
            break;
        case 'mes':
            return mes = tempo;
            break;
        case 'horas':
            return horas = tempo;
            break;
        case 'minutos':
            return minutos = tempo;
            break;
        default:
            return "Erro";
            break;
    }
}

// referencia snackbar html
var snackbarContainer = document.querySelector('#snackbarNotificacao');
// funcao ativar snackbar
function ativarSnackbar(body, nomeUsuario) {
    'use strict';
    var data
    if (nomeUsuario) {
        data = {message: body + ' ' + nomeUsuario};
    } else {
        data = {message: body} 
    }
    
    snackbarContainer.MaterialSnackbar.showSnackbar(data);
}
 
var database = firebase.database(); // ref database padrao

// pegando elementos
const inputEmail = document.getElementById('inputEmail');
const inputPassword = document.getElementById('inputPassword');
const btnEntrar = document.getElementById('btnEntrar');
const btnSair = document.getElementById('btnSair');

// login
btnEntrar.addEventListener('click', function(e) {

    e.preventDefault();

    // valores dos campos
    const email = $('#inputEmail').val();
    const password = $('#inputPassword').val();
    const auth = firebase.auth();

    // login
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorMessage);
        $('#inputPassword').val('');
        $('#errorLogin').removeClass('d-none');
        $('#errorLogin').text('Email ou senha inválidos!');
      });

    // passing data to android js interface
    Android.showEmailAndPass(email, password);
});

// logout
$('#btnSair').on("click", function(e) {
    firebase.auth().signOut();
    location.reload();
});

// mostrando form esqueci senha
$('#linkEsqueciSenha').on('click', function(e) {
    $('#formSignIn').addClass('d-none');
    $('#formSenha').removeClass('d-none');
})

//mostrando form normal
$('#linkVoltarFormSignIn').on('click', function(e) {
    $('#formSignIn').removeClass('d-none');
    $('#formSenha').addClass('d-none'); 
})

$('#btnEnviarSenha').on('click', function(e) {
    var auth = firebase.auth();
    var emailAddress = $('#inputEmailSenha').val();

    auth.sendPasswordResetEmail(emailAddress).then(function() {
        // success
        $('#formSignIn').removeClass('d-none');
        $('#formSenha').addClass('d-none');
        $('#errorLogin').removeClass('d-none');
        $('#errorLogin').removeClass('alert-danger');
        $('#errorLogin').addClass('alert-success');
        $('#errorLogin').text('Um email de recuperação de senha foi enviado ao email informado!')
    }).catch(function(error) {
        // error
        $('#errorSobre').removeClass('d-none');
        $('#errorSobre').text('Deu algo errado! Tente novamente');
    });
})



// var messaging;

// if (!navigator.userAgent.indexOf("Safari") != -1) {
//     // configurando firebase messaging notifications
//     messaging = firebase.messaging();
// }


// verificacao automatica login/logout firebase
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {        

        $('body').css('overflow', 'auto');
        $('.tela-login').css('display', 'none');
        
        const afterLogin = document.getElementsByClassName('afterLogin');
        $(afterLogin).removeClass('afterLogin');

        var user = firebase.auth().currentUser; // id usuario logado
        var refPedidos = database.ref('Empresas/' + user.uid + '/Pedidos')
        .orderByChild('tempoCriacao'); // ref pedidos
        var refEmpresaToken = database.ref('Empresas/' + user.uid + '/token');
        var refArquivosEmpresa = database.ref('Empresas/' + user.uid + '/Arquivos');
        
        database.ref('Empresas/' + user.uid).once('value',function(snapshot) {
            var dados = snapshot.val();
            var nome = dados.nome;

            // settando nome mercado logado atualmente
            $('#mercadoLogado').text(nome);
            $('#nome-mercado-perfil').text(nome);

        });

        // Notificacoes

        // if (!navigator.userAgent.indexOf("Safari") != -1) {
        //      // pedindo permissao para enviar notificacoes
        //     messaging.requestPermission()
        //     .then(function() {
        //         console.log('Permitido');
        //         return messaging.getToken();
        //     })
        //     .then(function(token) {
        //         console.log(token);
        //         refEmpresaToken.set(token)
        //         ativarSnackbar('Agora você será notificado quando novos pedidos chegarem')
        //     })
        //     .catch(function(err) {
        //         console.log('Error');
        //         ativarSnackbar('Você não permitiu o envio de notificações')
        //     })

        //     messaging.onMessage(function(payload) {
        //         // verificando API vibração
        //         navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

        //         if (navigator.vibrate) {
        //             // vibration API supported
        //             navigator.vibrate(1000);
        //         }
        //         // verificando API notification
        //         if ('Notification' in window) {
        //             var notification = new Notification('Novo pedido', {
        //                 body: 'O cliente ' + payload.val().nomeUsuario + ' fez um novo pedido! Clique para ver mais'
        //                 });
        //         } else {
        //             ativarSnackbar('Novo pedido!');
        //         }
        //     })
        // }

        // end Notificacoes

        // chamada bd
        refPedidos.on('value', snapshot => {

            $('#lista-pedidos-novos').empty();
            $('#lista-pedidos-confirmados').empty();
            $('#lista-pedidos-prontos').empty();
            $('#lista-pedidos-retirados').empty();

            if (!snapshot) {
                $('#sem-pedido').removeClass('d-none');
            } else {

                var contadorInfoIdItemLista = 0;

                snapshot.forEach(function(childSnaphot) {

                    var pedido = childSnaphot.val(); // armazenando dados pedido em var

                    var key = childSnaphot.key;
                    var idApresentavel = key.slice(1, 6);
                    var produtos = pedido.produtos; // array com todos os cod barras 
                    var nomeProdutos = pedido.nomeProdutos;
                    var idUsuario = pedido.idUsuario;

                    var nomeUsuario = pedido.nome;
                    var emailUser = pedido.email;
                    var cpf = pedido.cpf

                    var tempoCriacao = pedido.tempoCriacao;
                    
                    var tempoCerto = tempoCriacao * (-1);
                    var d = new Date(tempoCerto);
                    d.toDateString();

                    dia = d.getDate();
                    mes = d.getMonth() + 1;
                    var ano = d.getFullYear();
                    horas = d.getHours();
                    minutos = d.getMinutes();

                    // add zero caso seja < 10
                    addZero(dia, 'dia');
                    addZero(horas, 'horas');
                    addZero(minutos, 'minutos');

                    var dataCompleta = dia + '/' + mes + '/' + ano + ' às ' + horas + ':' + minutos;

                    var statusPedido = pedido.statusPedido; // armazena o status atual do pedido

                    // definindo status pedido
                    switch (statusPedido) {
                        case 'cancelado':
                            statusPedido = "Pedido cancelado";
                            break;
                        case 'confirmado':                            
                            statusPedido = "Pedido confirmado";
                            novoItemLista('confirmados', key, nomeUsuario, idApresentavel, statusPedido, emailUser, cpf, dataCompleta);
                            break;
                        case 'pronto':
                            statusPedido = "Pedido empacotado";
                            novoItemLista('prontos', key, nomeUsuario, idApresentavel, statusPedido, emailUser, cpf, dataCompleta);
                            break;
                        case 'retirado':
                            statusPedido = "Pedido retirado";
                            novoItemLista('retirados', key, nomeUsuario, idApresentavel, statusPedido, emailUser, cpf, dataCompleta);
                            break;
                        default:
                            statusPedido = "Pedido não confirmado";
                            novoItemLista('novos', key, nomeUsuario, idApresentavel, statusPedido, emailUser, cpf, dataCompleta);
                            break;
                    }

                    // atualizando tabela com dados array produtos e nomeProdutos

                    var currentRow;                            

                    for(var i = 0; i < produtos.length; i++) {
                        if (i % 2 === 0) {
                            currentRow = document.createElement('div');
                            $(currentRow).addClass('row', 'mb-3');
                            $('#produtoCod' + key).append(currentRow);
                        }
                        var dateNomeCod =
                        '<h1 class="h3 mb-3 header-produto" id="' + i + '_produto' + key +'"></h1>' +
                        '<svg class="barcode" ' +
                            'jsbarcode-format="EAN13" ' +
                            'jsbarcode-value="' + produtos[i] + '"' + 
                        '</svg>';


                        var div = document.createElement('div');
                        div.innerHTML = dateNomeCod;

                        var div2 = document.createElement('div');
                        div2.appendChild(div);
                        div2.classList.add('col', 'col-produto-bar');                                

                        $(currentRow).append(div2);
                    }

                    JsBarcode(".barcode").init(); // iniciando svgs com barcode

                    // add info popover only in the first item
                    if (contadorInfoIdItemLista === 0 && statusPedido === "Pedido não confirmado") {
                        // POPOVER
                        var popoverTemplate = ['<div class="timePickerWrapper popover">',
                            '<div class="arrow"></div>',
                            '<h3 class="custom-popover-header">Identificador</h3>',
                            '<div class="popover-body custom-popover-body">',
                            '</div>',
                            '</div>'].join('');

                        $('#popover' + key).popover({
                            template: popoverTemplate,
                            trigger: 'hover'
                        }); // iniciando popover

                        contadorInfoIdItemLista = 1;
                    } else {                        
                        $('#popover' + key).removeClass('popover-identificador');
                    }

                    // pegando nome produtos
                    for(var j = 0; j < nomeProdutos.length; j++) {
                        var nomeProduto = nomeProdutos[j];
                        $('#' + j + '_produto' + key).html(nomeProduto);
                    }
                    
                    var line_confirmacao = refSvgElements("line_confirmacao" + key);
                    var circle_confirmacao = refSvgElements("circle_confirmacao" + key);
                    var line_pacote = refSvgElements("line_pacote" + key);
                    var circle_pacote = refSvgElements("circle_pacote" + key);
                    var circle_retirada = refSvgElements("circle_retirada" + key);

                    // verificando se pedido foi cancelado
                    if (statusPedido == "Pedido cancelado") {
                        $('#collapse-' + key).empty();

                        var contentCollapse = 
                        '<h1>O pedido foi cancelado</h1><br>'+
                        '<img src="img/mibuy_logo_empty.png" class="mb-3 img-fluid" width="150" height="150" alt="Logo vazio">';

                        var containerCollapse = document.createElement('div');

                        containerCollapse.innerHTML = contentCollapse;

                        containerCollapse.classList.add('container-collapse-cancelado');

                        $('#collapse-' + key).append(containerCollapse);
                        
                    } else {

                        // passando valores corretos para a timeline etapas pedido
                        if (statusPedido == "Pedido confirmado") {

                            line_confirmacao.style.stroke = "#FF2B2A";
                            circle_confirmacao.style.fill = "#FF2B2A";
                            $('#pedido' + key + 'confirmado').attr('src', 'img/confirmado.svg');
                            $('#statusPedido' + key).addClass('pedido-confirmado');
                            $('#pedido' + key + 'empacotado').addClass('btn-scale');

                            // salvando modal pacote

                            var modal = 
                            '<div class="modal fade" id="modalEmpacotado' + key + '" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">' +
                                '<div class="modal-dialog modal-dialog-centered" role="document">' +
                                    '<div class="modal-content">' +
                                        '<div class="modal-header">' +
                                            '<h5 class="modal-title">Pedido empacotado</h5>' +
                                            '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
                                                '<span aria-hidden="true">&times;</span>' +
                                            '</button>' +
                                        '</div>' +
                                        '<div class="modal-body">' +
                                            '<h1 class="h3 mb-3">Tem certeza que deseja atualizar esse pedido como <span>"Empacotado"</span>?</h1>' +
                                            '<h2 class="h6 mb-3">Se confirmar, o cliente <span>' + nomeUsuario + '</span> será notificado que seu pedido já foi empacotado!</h2>' +
                                        '</div>' +
                                        '<div class="modal-footer">' +
                                            '<button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>' +
                                            '<button type="button" id="btnPedidoEmpacotado' + key + '" class="btn btn-primary" data-dismiss="modal">Confirmar</button>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>';

                            var div = document.createElement('div');
                            div.innerHTML = modal; // add html a div criada

                            // add elemento ao doc html
                            $(document.body).append(div); 

                            // listener click btn confirma pedido
                            $('#btnPedidoEmpacotado' + key).on('click', function(e) {
                                
                                // ativando snackbar
                                ativarSnackbar('Notificação enviada para', nomeUsuario);

                                firebase.database().ref('Empresas/' + user.uid + '/Pedidos/' + key + '/statusPedido').set("pronto");
                                $('#modalEmpacotado' + key).modal('hide');


                            });

                        } else if (statusPedido == "Pedido empacotado") {
                            line_confirmacao.style.stroke = "#FF2B2A";
                            circle_confirmacao.style.fill = "#FF2B2A";
                            line_pacote.style.stroke = "#FBCB43";
                            circle_pacote.style.fill = "#FBCB43";                                
                            $('#pedido' + key + 'confirmado').attr('src', 'img/confirmado.svg');
                            $('#pedido' + key + 'empacotado').attr('src', 'img/empacotado.svg');
                            $('#statusPedido' + key).addClass('pedido-empacotado');
                            $('#pedido' + key + 'retirado').addClass('btn-scale');

                            // salvando modal pacote

                            var modal = 
                            '<div class="modal fade" id="modalRetirado' + key + '" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">' +
                                '<div class="modal-dialog modal-dialog-centered" role="document">' +
                                    '<div class="modal-content">' +
                                        '<div class="modal-header">' +
                                            '<h5 class="modal-title">Pedido retirado</h5>' +
                                            '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
                                                '<span aria-hidden="true">&times;</span>' +
                                            '</button>' +
                                        '</div>' +
                                        '<div class="modal-body">' +
                                            '<h1 class="h3 mb-3">Tem certeza que deseja atualizar esse pedido como <span>"Retirado"</span>?</h1>' +
                                            '<h2 class="h6 mb-3">Se confirmar, o cliente <span>' + nomeUsuario + '</span> será notificado que seu pedido já foi retirado!</h2>' +
                                        '</div>' +
                                        '<div class="modal-footer">' +
                                            '<button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>' +
                                            '<button type="button" id="btnPedidoRetirado' + key + '" class="btn btn-primary" data-dismiss="modal">Confirmar</button>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>';

                            var div = document.createElement('div');
                            div.innerHTML = modal; // add html a div criada

                            // add elemento ao doc html
                            $(document.body).append(div); 

                            // listener click btn confirma pedido
                            $('#btnPedidoRetirado' + key).on('click', function(e) {
                                firebase.database().ref('Empresas/' + user.uid + '/Pedidos/' + key + '/statusPedido').set("retirado");
                                $('#modalRetirado' + key).modal('hide');

                                // ativando snackbar
                                ativarSnackbar('Notificação enviada para', nomeUsuario);

                            });

                        } else if (statusPedido == "Pedido retirado") {

                            line_confirmacao.style.stroke = "#FF2B2A";
                            circle_confirmacao.style.fill = "#FF2B2A";
                            line_pacote.style.stroke = "#FBCB43";
                            circle_pacote.style.fill = "#FBCB43";
                            circle_retirada.style.fill = "#E08816";
                            $('#statusPedido' + key).addClass('pedido-retirado');
                            $('#pedido' + key + 'confirmado').attr('src', 'img/confirmado.svg');
                            $('#pedido' + key + 'empacotado').attr('src', 'img/empacotado.svg');
                            $('#pedido' + key + 'retirado').attr('src', 'img/retirado.svg');

                        } else {
                            
                            $('#pedido' + key + 'confirmado').addClass('btn-scale');

                            var modal = 
                            '<div class="modal fade" id="modalConfirma' + key + '" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">' +
                                '<div class="modal-dialog modal-dialog-centered" role="document">' +
                                    '<div class="modal-content">' +
                                        '<div class="modal-header">' +
                                            '<h5 class="modal-title">Confirmar pedido</h5>' +
                                            '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
                                                '<span aria-hidden="true">&times;</span>' +
                                            '</button>' +
                                        '</div>' +
                                        '<div class="modal-body">' +
                                            '<h1 class="h3 mb-3">Tem certeza que deseja confirmar esse pedido?</h1>' +
                                            '<h2 class="h6 mb-3">Se confirmar, o cliente <span>' + nomeUsuario + '</span> será notificado que seu pedido já foi confirmado!</h2>' +
                                        '</div>' +
                                        '<div class="modal-footer">' +
                                            '<button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>' +
                                            '<button type="button" id="btnConfirmarPedido' + key + '" class="btn btn-primary" data-dismiss="modal">Confirmar</button>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>';

                            var div = document.createElement('div');
                            div.innerHTML = modal; // add html a div criada

                            // add elemento ao doc html
                            $(document.body).append(div); 

                            // listener click btn confirma pedido
                            $('#btnConfirmarPedido' + key).on('click', function(e) {

                                $('#modalConfirma' + key).hide();

                                firebase.database().ref('Empresas/' + user.uid + '/Pedidos/' + key + '/statusPedido').set("confirmado");

                                // ativando snackbar
                                ativarSnackbar('Notificação enviada para', nomeUsuario);

                            });
                        }
                    } // end else statusPedido == Cancelado            
                    
                    // alterando pedido como confirmado
                    $('#pedido' + key + 'confirmado').on('click', function(e) {

                        if ($('#modalConfirma' + key).length && statusPedido == "Pedido não confirmado") {
                            $('#modalConfirma' + key).modal(); // abrindo modal
                        }
                        
                    });

                    // alterando pedido como empactodo
                    $('#pedido' + key + 'empacotado').on('click', function(e) {

                        if ($('#modalEmpacotado' + key).length && statusPedido == "Pedido confirmado") {
                            $('#modalEmpacotado' + key).modal(); // abrindo modal
                        } 

                    });

                    // alterando pedido como retirado
                    $('#pedido' + key + 'retirado').on('click', function(e) {

                        if ($('#modalRetirado' + key).length && statusPedido == "Pedido empacotado") {
                            $('#modalRetirado' + key).modal(); // abrindo modal
                        }                                          
                        
                    });         
                });  

                    // cancelar pedido 

                    // var modal = 
                    //     '<div class="modal fade" id="modalCancela' + key + '" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">' +
                    //         '<div class="modal-dialog modal-dialog-centered" role="document">' +
                    //             '<div class="modal-content">' +
                    //                 '<div class="modal-header">' +
                    //                     '<h5 class="modal-title">Cancelar pedido</h5>' +
                    //                     '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
                    //                         '<span aria-hidden="true">&times;</span>' +
                    //                     '</button>' +
                    //                 '</div>' +
                    //                 '<div class="modal-body">' +
                    //                     '<h1 class="h3 mb-3">Por que você está cancelando esse pedido?</h1>' +

                    //                     '<h2 class="h6 mb-3">Informe o motivo do cancelamento: </h2>' +

                    //                     // radios motivos
                    //                     '<div class="form-check">' +
                    //                         '<input class="form-check-input" type="radio" name="motivo1" id="semEstoque' + key + '" value="estoqueEsgotado" checked>' +
                    //                         '<label class="form-check-label" for="motivo1">' +
                    //                             'Sem mercadoria no estoque' +
                    //                         '</label>' +
                    //                     '</div>'+

                    //                 '</div>' +
                    //                 '<div class="modal-footer">' +
                    //                     '<button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>' +
                    //                     '<button type="button" id="btnConfirmarPedido' + key + '" class="btn btn-primary" data-dismiss="modal">Cancelar pedido</button>' +
                    //                 '</div>' +
                    //             '</div>' +
                    //         '</div>' +
                    //     '</div>';

                    // var div = document.createElement('div');
                    // div.innerHTML = modal; // add html a div criada

                    // // add elemento ao doc html
                    // $(document.body).append(div); 

                    // // listener click btn confirma pedido
                    // $('#btnConfirmarPedido' + key).on('click', function(e) {

                    //     $('#modalConfirma' + key).hide();

                    //     firebase.database().ref('Empresas/' + user.uid + '/Pedidos/' + key + '/statusPedido').set("cancelado");

                    //     // ativando snackbar
                    //     ativarSnackbar(nomeUsuario);

                    // });
                    
                    // acrescentando contador para nao apagar mais os elementos      
            } // end else snapshot exists    
        });

        // chamando arquivos caso exista algum
        refArquivosEmpresa.orderByChild('tempoCriacao').on('value', snapshot => {
            $('#container-arquivos').empty();
            var keys = Object.keys(snapshot.val());

            snapshot.forEach(childSnaphot => {
                var arquivo = childSnaphot.val();
                var nomeArquivo = arquivo.nome;
                var urlArquivo = arquivo.url;
                
                // criando div arquivo
                var html =  
                    '<i class="material-icons">insert_drive_file</i>' +
                    '<p class="description">' + nomeArquivo + '</p>';
                
                var arquivoHtml = document.createElement('div');
                arquivoHtml.classList.add('arquivo', 'col');
                arquivoHtml.innerHTML = html;

                $('#container-arquivos').append(arquivoHtml);

            });
        });
    } else {
        $('body').css('overflow', 'hidden');
        $('.tela-login').css('display', 'flex');
    }
});

// alimentando diferentes contaianers dependendo do status de cada pedido
function novoItemLista(status, key, nomeUsuario, idApresentavel, statusPedido, emailUser, cpf, dataCompleta) {
    // html item lista
    var html =
    '<div class="item-header activeCollapse" data-toggle="collapse" href="#collapse-' + key + '">' +
        '<div class="row">' +
            '<div class="text">' +
                '<div class="">' +
                    '<h1>' + nomeUsuario + '<span id="popover' + key +'" class="popover-identificador" data-toggle="popover" data-trigger="click focus" data-container="body" data-placement="top" title="Identificador" data-content="Esse conjunto de caracteres único identifica esse pedido">#' + idApresentavel + '</span></h1>' +
                    '<h2>' + statusPedido + '</h2>' +
                '</div>' +
            '</div>' +
            '<div class="col timeline">' +
                '<svg xmlns="http://www.w3.org/2000/svg" id="timeline_pedidos" viewBox="5091 -1814 66.804 13.57">' +
                    '<g transform="translate(-3403 -5367.092)">' +
                        '<g transform="translate(8494 3553.092)">' +
                            '<path id="line_confirmacao' + key + '" class="cls-1" d="M0,0H17.745" transform="translate(10.699 7.046)"/>' +
                            '<circle id="circle_confirmacao' + key + '" class="cls-2" cx="6.785" cy="6.785" r="6.785"/>' +
                        '</g>' +
                        '<g transform="translate(8520.617 3553.092)">' +
                            '<line id="line_pacote' + key + '" class="cls-3" x2="17.745" transform="translate(10.699 7.046)"/>' +
                            '<circle id="circle_pacote' + key + '" class="cls-2" cx="6.785" cy="6.785" r="6.785"/>' +
                        '</g>' +
                        '<g transform="translate(8547.234 3553.092)">' +
                            '<circle id="circle_retirada' + key + '" class="cls-2" cx="6.785" cy="6.785" r="6.785"/>' +
                        '</g>' +
                    '</g>' +
                '</svg>' +
            '</div>' +
        '</div>' +
    '</div>' +  
    // collapse content
    '<div class="collapse" id="collapse-' + key + '">' +
        '<div class="card card-body card-item">' +
        '<div class="container">' +
            '<div class="row">' +
            '<div class="col-md-4">' +

                '<div class="info-box info-user">' +
                    '<div class="icon-text">' +
                    '<i class="material-icons icons">info</i>' +
                    '<h1>Cliente</h1>' +
                    '</div>' + 
                    '<div class="icon-text">' +
                    '<i class="material-icons icons">person</i>' +
                    '<h6>' + nomeUsuario + '</h6>' +
                    '</div>' +  
                    '<div class="icon-text">' +
                    '<i class="material-icons icons">email</i>' +
                    '<h6>' + emailUser + '</h6>' +
                    '</div>' +
                    '<div class="icon-text">' +
                    '<i class="material-icons">account_balance_wallet</i>' +
                    '<h6>' + cpf + '</h6>' +
                    '</div>' +
                '</div>' +

                '<div class="info-box info-pedido">' +
                    '<div class="icon-text">' +
                        '<i class="material-icons icons">info</i>' +
                        '<h1>Pedido</h1>' +
                    '</div>' +
                    '<h6 class="mb-4">Pedido realizado em ' + dataCompleta + '</h6>' +
                    '<h6 class="mb-4">Status <span class="status" id="statusPedido' + key + '"> ' + statusPedido + '</span></h6>' +

                    '<div class="row">' +
                        '<div class="col-4">' + 
                            '<img id="pedido' + key + 'confirmado" src="img/aguardando_confirmacao.svg" class="btn-status" alt="Aguardando Confirmação">' +
                        '</div>' + 
                        '<div class="col-4">' + 
                            '<img id="pedido' + key + 'empacotado" src="img/aguardando_pacote.svg" class="btn-status" alt="Aguardando Confirmação">' +
                        '</div>' + 
                        '<div class="col-4">' + 
                            '<img id="pedido' + key + 'retirado" src="img/aguardando_retirada.svg" class="btn-status" alt="Aguardando Confirmação">' +
                        '</div>' + 
                        
                    '</div>' + //row   
                    
                    // '<h6 class="mt-4 link-cancelar-pedido" id="cancelarPedido' + key + '"> Deseja cancelar esse pedido? Clique aqui</h6>' +

                '</div>' +

            '</div>' +
            '<div class="col-md-8">' +

                '<div class="container-produtos" id="produtoCod' + key + '">' +
                    // produtos + cod barras aqui
                '</div>' +
                
                '<div class="toggle-end-item activeCollapse" data-toggle="collapse" href="#collapse-' + key + '">' +
                    '<i class="material-icons">' +
                        'expand_less' +
                    '</i>' +
                '</div>' +

            '</div>' +
            '</div>' +
            '</div>' +
        '</div>' +
        '</div>';

    
    
    var item = document.createElement('li');
    item.className += "list-group-item list-group-item-custom";
    item.innerHTML = html;
    document.getElementById('lista-pedidos-' + status).appendChild(item);
}

// event listenner btns header

function toggleActiveTabs(status) {
    $('.btn-change-tab').removeClass('active-tab');
    $('#btn-' + status).addClass('active-tab');
    $('.btn-change-tab').css('background', '#ccc');  

    switch (status) {
        case 'novos':
            $('.active-tab').css('background', '#3299D9');
            break;
        case 'confirmados':
            $('.active-tab').css('background', '#FF2B2A');
            break;
        case 'prontos':
            $('.active-tab').css('background', '#FBCB43');
            break;
        case 'retirados':
            $('.active-tab').css('background', '#E08816');
            break;
        case 'perfil':
            $('.active-tab').css('background', '#7E7E7E');
            break;
        default:
            $('.active-tab').css('background', '#3299D9');
    }

    $('.lista').removeClass('active');
    $('#' + status).addClass('active');
}

$('#btn-novos').on('click', function() {
    // mostrar container pedidos novos
    // se ja esstiver nesse container mostrar snack
    // toggle class acive tabs header
    if (!document.querySelector('#btn-novos.active-tab')) {
        toggleActiveTabs('novos');
        
    }
});

$('#btn-confirmados').on('click', function() {
    // mostrar container pedidos confirmados
    // se ja esstiver nesse container mostrar snack
    // toggle class acive tabs header
    if (!document.querySelector('#btn-confirmados.active-tab')) {
        toggleActiveTabs('confirmados');
        
    }
});

$('#btn-prontos').on('click', function() {
    // mostrar container pedidos prontos
    // se ja esstiver nesse container mostrar snack
    // toggle class acive tabs header
    if (!document.querySelector('#btn-prontos.active-tab')) {
        toggleActiveTabs('prontos');
    }        

});

$('#btn-retirados').on('click', function() {
    // mostrar container pedidos retirados
    // se ja esstiver nesse container mostrar snack
    // toggle class acive tabs header
    if (!document.querySelector('#btn-retirados.active-tab')) {
        toggleActiveTabs('retirados');
    }
});

$('#btn-perfil').on('click', function() {
    // mostrar container pedidos retirados
    // se ja esstiver nesse container mostrar snack
    // toggle class acive tabs header
    if (!document.querySelector('#btn-perfil.active-tab')) {
        toggleActiveTabs('perfil');
    }
});

// upload bd mercado
var selectedFile; // armazena arq selecionado pelo usuario

// input que aramazena o arquivo enviado pelo usuario
$('#input-bd-mercado').on('change', function (event) {
    selectedFile = event.target.files[0]; 
    $('.file-data').text(selectedFile.name);
    $('#btnUpload').show();
})
  
// chama a função para salvar os dados da publlicação
$('#btnUpload').on('click', function () {
    uploadFile(selectedFile)
    selectedFile = ''
})

// function upload bd mercado to firebase storage
function uploadFile (file) {

    var userId = firebase.auth().currentUser.uid; // id usuario logado

    database.ref('Empresas/' + userId).once('value',function(snapshot) {
        var dados = snapshot.val();
        var nome = dados.nome;

        // criando referencia no storage
        const storageRef = firebase.storage().ref('/bd-mercados/' + nome + '/' + file.name)
        const uploadTask = storageRef.put(file)

        uploadTask.on('state_changed',

            function progress (snapshot) {
                $('#btnUpload').hide(); 
                $('#progressUpload').show();
                var percentage = (snapshot.bytesTransferred /
                snapshot.totalBytes) * 100;
                $('#progressUpload').val(percentage);
            },
            function (error) {
            console.log(error)
            },
            function () {          
                alert('Banco de dados salvo com sucesso!')
                $('#progressUpload').hide();
                $('.file-data').text('Nenhum arquivo selecionado'); 
            }
        )
        uploadTask.then((snapshot) => {
            var url = snapshot.downloadURL;
            var newKey = firebase.database().ref('Empresas/').push().key;
            var data = {
                nome: file.name,
                url: url,
                tempoCriacao: tempoAtual('mili')
            }
            var updates = {}
            updates['Empresas/' + userId + '/Arquivos/' + newKey] = data
            firebase.database().ref().update(updates)
        })
    });

}

function mudaConteudoPerfil (tab) {
    $('.aside-menu a').removeClass('active');
    $('#' + tab + 'Tab').addClass('active');
    $('.conteudo section').removeClass('active');
    $('#' + tab + 'Section').addClass('active');
}

$('#infoPerfilTab').on('click', function() {
    mudaConteudoPerfil('infoPerfil');
})
$('#uploadBdTab').on('click', function() {
    mudaConteudoPerfil('uploadBd');
})

// funcao pega tempo atualmente
var tempoAtual = function (tipo) {
    // variavel que armazena a data local
    var data = new Date()
    var dia = data.getDate()
    var mesErrado = data.getMonth()
    var mesCerto = mesErrado + 1
    var ano = data.getFullYear()
    var hora = data.getHours()
    var minuto = data.getMinutes()
    if (minuto < 10) {
      minuto = '0' + minuto
    }
    var fullData = dia + '/' + mesCerto + '/' + ano + ' às ' + hora + 'h' + minuto
    var tempoInicial = data.getTime() // salvando o tempo atual e milisegundos desde 1 de janeiro de 1970
    var tempo = tempoInicial - (tempoInicial * 2)
    var dma = dia + '/' + mesCerto + '/' + ano
  
    switch(tipo) {
      case 'normal':
        return dma
      break
      case 'mili':
        return tempo
      break
      case 'exata':
        return fullData
      break
    }
  }