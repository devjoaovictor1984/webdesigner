//=====================================================
// MINI DASHBOARD DO CLIMA - AULA COMPLETA E EXPLICADA
//=====================================================

// Neste código, vamos construir passo a paso um mini dashboard
// consulta a API do openweather e mostra o clima no Brasil.
// Casa etapa tem um comentário e console.log para você tem a doc

// 1 - INÍCIO Esperar o codumento carregar
$(document).ready(function () { // aguardar o HTML se carregado para iniciar o código

    console.log("%c[1] Documento carregado", "color:green; font-weight:bold;");//mosta o JS foi iniciado
    console.log("O JavaScript só começa a rodar depois que o HTML foi carregado!"); // explicação


    // --------------------------------------------
    // 2 - Evento de clique no BOTÃO
    // --------------------------------------------

    $("#buscar").on("click", function () {  // quando o botão Buscar for clicado...

        console.log("%c[2] Botão clicado ", "color:orage;font-weight:bold;"); //mosta que o clique foi detectado
        console.log("Agora vamos capturar o nome da cidade digitada..."); // Orienta para a próxima etapa

        // --------------------------------------------
        // 3 - capturar o valor do INPUT
        // --------------------------------------------

        var cidade = $("#cidade").val(); // pega o valor digitado no campo de texto
        console.log("Cidade digitada: ", cidade);

        if (cidade === "") {
            console.warn("Nenhuma cidade digitada, Mostrando o aviso na tela."); //alerta no console
            $("#resultado").html("<p>Por favor, digite o nome de uma cidade.</p>"); //mostra a mensagem html
            return;
        };

        // --------------------------------------------
        // 4 - MONTAR A URL DA API
        // --------------------------------------------

        var apiKey = "f6acb2cb9ab20d052f59407c1426e9cb"; //Substitua pela sua chave real do site OpenWeather
        var url = "https://api.openweathermap.org/data/2.5/weather?q=" + cidade + ",br&appid=" + apiKey + "&units=metric&lang=pt_br";

        console.log("%c[3] URL da API montada: ", "color:cyan;"); //mostra o link gerado
        console.log(url);
        console.log("Observe como ela tem parâmetros: q=cidade, appid=chave, units=metric, lang=pt_br");

        // --------------------------------------------
        // 5 - FAZER A REQUISIÇÃO AJAX usando $getJSON
        // --------------------------------------------

        console.log("%c[4] Fazendo a requisição AJAX ", "color:blur;font-weight:bold;"); //indica a requisição
        console.log("Agora o javascript vai até a internet buscar os dados");

        $.getJSON(url, function (dados) { // faz a requisição e recebe o JSON na variável dados

            // --------------------------------------------
            // 6 - RESPOSTA RECEBIDA
            // --------------------------------------------

            console.log("%c[5] Resposta da API recebida com sucesso.", "color:limegreen;font-weight:bold;");
            console.log("Aqui está o objeto completo retornado pela API:"); //introdução
            console.log(dados);

            // --------------------------------------------
            // 7 - EXTRAIR OS DADOS DO OBJETO JSON
            // --------------------------------------------

            var nome = dados.name; // Nome da cidade
            var temp = Math.round(dados.main.temp); //Temperatura arredondada
            var desc = dados.weather[0].description; // descriçã textual do clima (ex: "céu limpo");
            var clima = dados.weather[0].main.toLowerCase(); // Tipo principal (ex clear, rain)

            console.log("%c[6] Dados extraídos: ", "color:purple;"); // Mostra que extraímos os dados
            console.table({ "Cidade": nome, "Temperatura (ºC)": temp, "Descrição": desc, "Tipo": clima }); //exibe a tabela


            // --------------------------------------------
            // 8 - DEFINIR O ÍCONE CONFORME O CLIMA
            // --------------------------------------------


            var icone = "../images/padrao.png"; //Ícone padrão (caso não identifique o clima)

            if (clima.indexOf("rain") !== -1 || desc.includes("chuva")) { icone = "../images/rain.png"; } // se tiver "rain" ou "chuva"
            else if (clima.indexOf("cloud") !== -1 || desc.includes("nublado")) { icone = "../images/cloudy.png"; } // se tiver "cloud"
            else if (clima.indexOf("clear") !== -1 || desc.includes("sol")) { icone = "../images/sun.png"; } // se tiver "clear"
            else if (clima.indexOf("thunder") !== -1 || desc.includes("tempestade")) { icone = "../images/storm.png"; } // tempestade
            else if (clima.indexOf("mist") !== -1 || desc.includes("neblina")) { icone = "../images/rain.png"; } // neblina
            else if (dados.dt > dados.sys.sunset) { icone = "../images/night.png" } // após o por do sol = noite

            console.log("%c[7] Ícone selecionado: ", "color:yellow;"); // mostra o ícone definido
            console.log(icone);

            // --------------------------------------------
            // 9 - MOSTRAR O HTML DINAMICANTE
            // --------------------------------------------

            console.log("%c[8] Mostrando o conteúdo HTML", "color: #ff9800");
            var html = ""; //criando a variável
            html += "<h2>" + nome + "</h2>"; // adicionar a cidade
            html += "<img src='" + icone + "' alt='ícone do clima'>"; //adiciona o ícone do clima
            html += "<p class='temp'>" + temp + "ºC</p>"; // mostra a temperatura
            html += "<p class='desc'>" + desc.charAt(0).toUpperCase() + desc.slice(1) + "</p>";
            html += "<p><b>Umidade:</b> " + dados.main.humidity + "%</p>";
            html += "<p><b>Vento: <b>" + dados.wind.speed + "km/h</p>"; // mostra a velocidade do vento

            console.log(html);

            // --------------------------------------------
            // 10 - INSERIR O HTML NO DOM
            // --------------------------------------------

            $("#resultado").html(html); //insere o HTML dentro da div "resultado"
            console.log("%c[9] Conteúdo inserido no DOM com sucesso: ", "color:#00bcd4; font-weight:bold;");
            console.log("Agora a informação aparece visultamente na página");

            // --------------------------------------------
            // 11 - ALTERAR O FUNDO CONFOME O CLIMA
            // --------------------------------------------

            var fundo = "linear-gradient(135deg, #1e3c72, #2a5298";
            if (clima.indexOf("rain") !== -1) { fundo = "linear-gradient(135deg, #4b79a1, #283e51"; } // fundo para chuva
            else if (clima.indexOf("cloud") !== -1) { fundo = "linear-gradient(135deg, #757f9a, #d7dde8"; } // fFundo para nublado
            else if (clima.indexOf("clear") !== -1) { fundo = "linear-gradient(135deg, #f7971e, #ffd200"; } // fundo para sol
            else if (dados.dt > dados.sys.sunset) { fundo = "linear-gradient(135deg, #0f2027,#203a43, #2c5364"; } // fundo para noite

            $("body").css("background", fundo); //aplicar a cor de fundo no body
            console.log("%c[10] Fundo alterado conforme o clima", "color:magenta;");
            console.log(fundo); //exibir o valor aplicado

            // --------------------------------------------
            // 12 - FIM DO PROCESSO
            // --------------------------------------------
            console.log("%c[10] Processo completo!", "color:green;font-size:16px;font-weight:bold;" ); //conclusão geral
            console.log("O ciclo completo foi executado: Evento -> API -> JSON -> DOM -> VISUAL.") // Explicação final

        })

        .fail(function() {
            console.error("Erro: a cidade não encontrada ou problema na API");
            $("#resultado").html("<p style='color:red'></p>");
        })

    });



});
