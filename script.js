const fs = require('fs');
const { parse } = require('path');

function guardarKnowledgeBase(knowledgeBase, archivo) {
    fs.writeFileSync(archivo, JSON.stringify(knowledgeBase, null, 2), 'utf-8');
}

function cargarKnowledgeBase(archivo) {
    try {
        const data = fs.readFileSync(archivo, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return { preguntas: [] };
    }
}

function cargarPalabrasClave(archivo) {
    try {
        const data = fs.readFileSync(archivo, 'utf-8');
        return data.split('\n').map(line => line.trim());
    } catch (error) {
        return [];
    }
}

class ChatBot {
    constructor(knowledgeBase, palabrasClaveTecnicas, bannedWords) {
        this.knowledgeBase = knowledgeBase;
        this.palabrasClaveTecnicas = palabrasClaveTecnicas;
        this.bannedWords = bannedWords;
    }

    findBestMatch(userQuestion) {
        const questions = this.knowledgeBase.preguntas.map(q => q.texto);
        const matches = questions.filter(q =>
            similarity(q, userQuestion) > 0.6
        );
        return matches.length > 0 ? matches[0] : null;
    }

    getAnswerForQuestion(question) {
        const foundQuestion = this.knowledgeBase.preguntas.find(q => q.texto === question);
        return foundQuestion ? foundQuestion.respuesta : null;
    }

    processUserInput(userInput) {
        const userLowerCase = userInput.toLowerCase();

        const palabrasProhibidas = this.bannedWords.filter(word =>
            userLowerCase.includes(word)
        );
        if (palabrasProhibidas.length > 0) {
            return `Bot: Has sido vetado por usar palabras prohibidas: ${palabrasProhibidas.join(', ')}`;
        }

        const bestMatch = this.findBestMatch(userInput);
        if (bestMatch) {
            const answer = this.getAnswerForQuestion(bestMatch);
            return `Bot: ${answer}`;
        } else {
            return 'Bot: No sé la respuesta. ¿Puede enseñármela?';
        }
    }

    calculateAverage(notasStr) {
        const notas = notasStr.split(' ').map(parseFloat).filter(nota => !isNaN(nota));
        try {
            if (notas.length === 5) {
                const notasInvalidas = notas.filter(nota => nota > 20);
                if (notasInvalidas.length > 0) {
                    return 'Bot: Ingrese notas válidas. Cada nota debe ser menor a 20.';
                } else {
                    const promedio = notas.reduce((acc, nota) => acc + nota, 0) / 5;
                    let respuesta = `Bot: El promedio de las notas es: ${promedio.toFixed(2)}`;

                    if (promedio >= 14) {
                        respuesta += '\nBot: ¡Felicidades! Has aprobado.';
                    } else {
                        respuesta += '\nBot: Lo siento, no has aprobado.';
                    }
                    return respuesta;
                }
            } else {
                return 'Bot: Por favor, ingresa exactamente 5 notas.';
            }
        } catch (error) {
            return 'Bot: Por favor, ingresa notas válidas.';
        }
    }
}

// Función para calcular similitud entre strings (método similar a difflib en Python)
function similarity(s1, s2) {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    const longerLength = longer.length;

    if (longerLength === 0) {
        return 1.0;
    }

    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    const costs = new Array();
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0) {
                costs[j] = j;
            } else if (j > 0) {
                let newValue = costs[j - 1];
                if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                    newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                }
                costs[j - 1] = lastValue;
                lastValue = newValue;
            }
        }
        if (i > 0) {
            costs[s2.length] = lastValue;
        }
    }
    return costs[s2.length];
}

// Cargar conocimiento base, palabras clave y palabras prohibidas
const knowledgeBase = cargarKnowledgeBase('knowledge_base.json');
const palabrasClaveTecnicas = cargarPalabrasClave('palabras_clave.txt');
const bannedWords = cargarPalabrasClave('banned_words.txt');

// Crear instancia del ChatBot (puedes ya tener esto en tu código)
const chatbot = new ChatBot(knowledgeBase, palabrasClaveTecnicas, bannedWords);