import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AirQualityData {
  aqi: number;
  location?: string;
  timestamp?: Date;
  pollutants?: {
    pm25?: number;
    pm10?: number;
    o3?: number;
    no2?: number;
  };
}

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
}

interface ChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  showFloatingButton?: boolean;
  embedded?: boolean;
  currentAQI?: number;
  airQualityData?: AirQualityData[];
  weatherData?: WeatherData;
}

export default function ChatWidget({ 
  isOpen, 
  onToggle, 
  showFloatingButton = true, 
  embedded = false,
  currentAQI,
  airQualityData,
  weatherData 
}: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '🛰️ ¡Hola! Soy tu asistente especializado en calidad del aire de TempoTrack.\n\n✨ Te puedo ayudar con:\n• Interpretación de datos AQI y contaminantes\n• Recomendaciones personalizadas de salud\n• Asesoramiento para grupos vulnerables (niños, embarazadas, asma, EPOC)\n• Actividades seguras según la calidad del aire actual\n\n¿Tienes alguna condición de salud específica o pregunta sobre calidad del aire?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sugerencias contextuales para calidad del aire
  const quickSuggestions = [
    {
      text: "¿Es seguro hacer ejercicio al aire libre hoy?",
      icon: "🏃‍♂️",
      category: "actividad"
    },
    {
      text: "Soy asmático, ¿qué precauciones debo tomar?",
      icon: "🫁",
      category: "salud"
    },
    {
      text: "¿Cómo afecta la calidad del aire a los niños?",
      icon: "👶",
      category: "vulnerables"
    },
    {
      text: "¿Qué significa el AQI actual?",
      icon: "📊",
      category: "datos"
    },
    {
      text: "Recomendaciones para embarazadas",
      icon: "🤱",
      category: "vulnerables"
    },
    {
      text: "¿Debo usar mascarilla al salir?",
      icon: "😷",
      category: "protección"
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setShowSuggestions(false);
    setIsLoading(true);

    try {
      // Preparar contexto de datos actuales
      const contextData = {
        currentAQI: currentAQI || 0,
        averageAQI: airQualityData?.length 
          ? Math.round(airQualityData.reduce((sum, data) => sum + data.aqi, 0) / airQualityData.length)
          : 0,
        dataPoints: airQualityData?.length || 0,
        weather: weatherData ? {
          temperature: weatherData.temperature,
          humidity: weatherData.humidity,
          windSpeed: weatherData.windSpeed
        } : null,
        timestamp: new Date().toLocaleString('es-ES')
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: textToSend,
          contextData: contextData 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.reply,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        console.error('API Error:', data);
        throw new Error(data.error || 'Error en la respuesta');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorText = 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.';
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorText = 'Error de configuración de API. Por favor, contacta al administrador.';
        } else if (error.message.includes('quota')) {
          errorText = 'Se ha alcanzado el límite de uso de la API. Intenta más tarde.';
        } else if (error.message.includes('network') || error.name === 'TypeError') {
          errorText = 'Error de conexión. Verifica tu conexión a internet e intenta de nuevo.';
        }
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSendClick = () => {
    sendMessage();
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  if (!isOpen) {
    return showFloatingButton ? (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Abrir chat"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    ) : null;
  }

  return (
    <div 
      className={`${embedded ? 'w-full h-full' : 'fixed z-50'} bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col`}
      style={embedded ? {} : {
        bottom: '1rem',
        right: '1rem',
        width: 'min(24rem, calc(100vw - 2rem))',
        height: 'min(32rem, calc(100vh - 2rem))',
        maxWidth: '95vw',
        maxHeight: '90vh'
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 sm:p-4 rounded-t-lg flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <span className="text-xs sm:text-sm font-bold">AI</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm sm:text-base truncate">TempoTrack AI</h3>
            <p className="text-[10px] sm:text-xs text-blue-100 hidden sm:block">Asistente de Calidad del Aire</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="text-white/80 hover:text-white transition-colors"
          aria-label="Cerrar chat"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 space-y-3 min-h-0">
        {/* Sugerencias contextuales */}
        {showSuggestions && messages.length <= 1 && (
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-3">💡 Sugerencias para comenzar:</p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className="flex items-center space-x-2 p-2 text-left bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors text-xs"
                  disabled={isLoading}
                >
                  <span className="text-base">{suggestion.icon}</span>
                  <span className="text-gray-700 flex-1">{suggestion.text}</span>
                </button>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-3">
              <p className="text-xs text-gray-500 text-center">
                Especializado en grupos vulnerables: niños, ancianos, embarazadas, personas con asma/EPOC
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[80%] p-2 sm:p-3 rounded-lg break-words ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="text-xs sm:text-sm leading-relaxed prose prose-xs max-w-none">
                <ReactMarkdown 
                  components={{
                    // Personalizar componentes para que se ajusten al estilo del chat
                    p: ({...props}) => <p className="mb-2 last:mb-0" {...props} />,
                    strong: ({...props}) => <strong className="font-semibold" {...props} />,
                    em: ({...props}) => <em className="italic" {...props} />,
                    ul: ({...props}) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                    ol: ({...props}) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
                    li: ({...props}) => <li className="text-xs sm:text-sm" {...props} />,
                    h1: ({...props}) => <h1 className="text-sm sm:text-base font-bold mb-1" {...props} />,
                    h2: ({...props}) => <h2 className="text-xs sm:text-sm font-bold mb-1" {...props} />,
                    h3: ({...props}) => <h3 className="text-xs sm:text-sm font-semibold mb-1" {...props} />,
                    code: ({...props}) => <code className="bg-black/10 px-1 rounded text-xs" {...props} />,
                  }}
                >
                  {message.text}
                </ReactMarkdown>
              </div>
              <p className={`text-[10px] sm:text-xs mt-1 opacity-75 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje aquí..."
            className="flex-1 border border-gray-300 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none bg-white min-h-[36px]"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSendClick}
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors shrink-0 w-10 h-10 flex items-center justify-center"
            aria-label="Enviar mensaje"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}