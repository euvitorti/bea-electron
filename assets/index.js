const startBtn = document.getElementById('startBtn');
const chatBox = document.getElementById('chatBox');

// Verifica se a API de SpeechRecognition está disponível
if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'pt-BR';

    startBtn.addEventListener('click', () => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(() => recognition.start())
            .catch(error => alert("Permissão para acessar o microfone negada."));
    });

    recognition.onresult = async (event) => {
        const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');

        try {
            const response = await fetch('http://localhost:8080/bea/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: transcript }),
            });

            if (response.ok) {
                const data = await response.json();
                chatBox.textContent = `Bea: ${data.message}`; // Exibe a resposta no chat
            } else {
                alert("Erro ao enviar mensagem para a API.");
            }
        } catch (error) {
            alert("Erro ao se comunicar com a API.");
        }
    };

    recognition.onerror = () => alert("Erro no reconhecimento de voz.");
} else {
    alert("Seu navegador não suporta o reconhecimento de voz.");
}
