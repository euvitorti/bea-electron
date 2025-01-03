const startBtn = document.getElementById('startBtn');
const transcriptArea = document.getElementById('transcript');
const chatBox = document.getElementById('chatBox');

// Verifica se a API de SpeechRecognition está disponível
if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'pt-BR';
    recognition.interimResults = true; // Exibe resultados intermediários enquanto a fala continua

    startBtn.addEventListener('click', () => {
        // Solicitar permissão explícita para o microfone
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(() => {
                recognition.start();  // Inicia o reconhecimento de voz se a permissão for concedida
            })
            .catch((error) => {
                console.error("Erro ao acessar o microfone:", error);
                alert("Permissão para acessar o microfone negada. Por favor, permita o acesso.");
            });
    });

    recognition.onresult = async (event) => {
        const transcript = Array.from(event.results)
            .map(result => result[0].transcript)  // Concatena os resultados
            .join('');
        
        transcriptArea.value = transcript;  // Exibe o texto reconhecido na área de texto

        // Adiciona a mensagem do usuário ao chat
        const userMessage = document.createElement('div');
        userMessage.classList.add('message', 'user-message');
        userMessage.textContent = transcript;
        chatBox.appendChild(userMessage);
        chatBox.scrollTop = chatBox.scrollHeight; // Rola o chat para baixo

        // Envia a mensagem para a API e espera a resposta
        try {
            const response = await fetch('http://localhost:8080/bea/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: transcript }),  // Envia a mensagem reconhecida
            });

            if (response.ok) {
                const data = await response.json();  // A resposta da API

                // Exibe a resposta da Bea no chat
                const beasResponse = document.createElement('div');
                beasResponse.classList.add('message', 'beas-message');
                beasResponse.textContent = data.message;  // Aqui, assumimos que a resposta da API tem um campo 'result'
                chatBox.appendChild(beasResponse);
                chatBox.scrollTop = chatBox.scrollHeight; // Rola o chat para baixo
            } else {
                console.error('Erro ao enviar a mensagem para a API');
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
            alert("Ocorreu um erro ao se comunicar com a API.");
        }
    };

    recognition.onerror = (event) => {
        console.error("Erro no reconhecimento de voz:", event.error);
        alert("Ocorreu um erro no reconhecimento de voz. Por favor, tente novamente: " + event.error);
    };
} else {
    alert("Seu navegador não suporta o reconhecimento de voz.");
}
