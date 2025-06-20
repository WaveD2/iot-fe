import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, X, Volume2 } from 'lucide-react';

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface CustomWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognition;
  webkitSpeechRecognition?: new () => SpeechRecognition;
}

declare const window: CustomWindow;

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceModal({ isOpen, onClose }: VoiceModalProps) {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [responseTexts, setResponseTexts] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef<boolean>(false);
  const lastProcessedTranscriptRef = useRef<string>('');
  const accessToken = localStorage.getItem("accessToken")
  ? JSON.parse(localStorage.getItem("accessToken") || "")
  : "";
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const processCommand = useCallback(async (text: string) => {
    if (!text.trim() || processingRef.current || text === lastProcessedTranscriptRef.current) {
      return;
    }
    
    lastProcessedTranscriptRef.current = text;
    processingRef.current = true;
    setIsProcessing(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_SERVER}/heart/voice`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "ngrok-skip-browser-warning": "69420",
        },
        body: JSON.stringify({ command: text }),
      });
      
      if (!response.ok) {
        throw new Error(`Lỗi API: ${response.status}`);
      }
      
      const data: { response: string } = await response.json();
      setResponseTexts((prev) => [...prev, data.response]);
      await speak(data.response);

    } catch (err) {
      console.error('Lỗi khi gửi lệnh:', err);
      const errorMsg = 'Xin lỗi, có lỗi xảy ra khi xử lý lệnh của bạn.';
      setResponseTexts((prev) => [...prev, errorMsg]);
      await speak(errorMsg);
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, []);

  const speak = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      const getBestVietnameseVoice = () => {
        const voicePriority = [
          (voice: SpeechSynthesisVoice) => voice.lang === 'vi-VN' && voice.name.includes('Google'),
          (voice: SpeechSynthesisVoice) => voice.lang === 'vi-VN' && voice.name.includes('Microsoft'),
          (voice: SpeechSynthesisVoice) => voice.lang === 'vi-VN' && voice.name.includes('Apple'),
          (voice: SpeechSynthesisVoice) => voice.lang === 'vi-VN',
          (voice: SpeechSynthesisVoice) => voice.lang.startsWith('vi'),
          (voice: SpeechSynthesisVoice) => voice.name.toLowerCase().includes('vietnamese'),
          (voice: SpeechSynthesisVoice) => voice.name.toLowerCase().includes('vietnam'),
        ];

        for (const criteria of voicePriority) {
          const voice = availableVoices.find(criteria);
          if (voice) return voice;
        }

        return null;
      };

      const selectedVoice = getBestVietnameseVoice();
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.lang = 'vi-VN';
      utterance.rate = 0.85;  
      utterance.pitch = 1.1;  
      utterance.volume = 0.9;  
      
      const processedText = text
        .replace(/\./g, '. ')  
        .replace(/,/g, ', ')  
        .replace(/\?/g, '? ')  
        .replace(/!/g, '! ')  
        .replace(/\s+/g, ' ')  
        .trim();
      
      utterance.text = processedText;

      utterance.onend = () => {
        console.log('Speech ended');
        resolve();
      };
      
      utterance.onerror = (event) => {
        console.error('Speech error:', event);
        resolve();
      };

      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 100);
    });
  };

  const stopRecordingAndProcess = useCallback((transcript: string) => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }

    setIsRecording(false);
    setCurrentTranscript('');

    const cleanTranscript = transcript.trim();
    if (cleanTranscript && cleanTranscript !== lastProcessedTranscriptRef.current) {
      setTranscripts((prev) => [...prev, cleanTranscript]);
      processCommand(cleanTranscript);
    }
  }, [processCommand]);

  const startRecording = async () => {
    if (processingRef.current) return;

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói. Vui lòng sử dụng Chrome hoặc Safari.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e: BlobEvent) => {
        audioChunksRef.current.push(e.data);
      };

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'vi-VN';
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      let finalTranscriptAccumulator = '';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let newFinalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            newFinalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (newFinalTranscript) {
          finalTranscriptAccumulator += newFinalTranscript;
        }

        const currentText = (finalTranscriptAccumulator + interimTranscript).trim();
        setCurrentTranscript(currentText);

        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        if (newFinalTranscript.trim()) {
          const finalText = finalTranscriptAccumulator.trim();
          if (finalText) {
            stopRecordingAndProcess(finalText);
            return;
          }
        }

        if (currentText) {
          silenceTimeoutRef.current = setTimeout(() => {
            if (currentText.trim()) {
              stopRecordingAndProcess(currentText);
            }
          }, 3000);  
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Lỗi nhận dạng giọng nói:', event.error);
        if (event.error === 'no-speech') {
          stopRecording();
        }
      };

      recognitionRef.current.onend = () => {
        console.log('Recognition ended');
      };

      recognitionRef.current.start();
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      finalTranscriptAccumulator = '';
      lastProcessedTranscriptRef.current = '';
      
    } catch (err) {
      console.error('Lỗi khi bắt đầu ghi âm:', err);
      alert('Không thể truy cập micro. Vui lòng kiểm tra quyền truy cập.');
    }
  };

  const stopRecording = () => {
    stopRecordingAndProcess(currentTranscript);
  };

  const clearHistory = () => {
    setTranscripts([]);
    setResponseTexts([]);
    lastProcessedTranscriptRef.current = '';
  };

  useEffect(() => {
    if (!isOpen) {
      if (isRecording) {
        stopRecording();
      }
      setCurrentTranscript('');
      lastProcessedTranscriptRef.current = '';
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-100/10 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Điều khiển giọng nói</h2>
              <p className="text-sm text-gray-500">Nói để thực hiện lệnh</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Voice Input */}
          <div className="text-center space-y-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
                isProcessing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
              } shadow-lg`}
            >
              {isProcessing ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isRecording ? (
                <MicOff className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </button>

            <div className="space-y-2">
              {isProcessing && (
                <p className="text-sm font-medium text-blue-600">Đang xử lý...</p>
              )}
              {isRecording && !isProcessing && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-600">Đang lắng nghe...</p>
                  {currentTranscript && (
                    <div className="bg-gray-50 rounded-lg p-3 mx-4">
                      <p className="text-sm text-gray-700 italic">"{currentTranscript}"</p>
                    </div>
                  )}
                </div>
              )}
              {!isRecording && !isProcessing && (
                <p className="text-sm text-gray-500">Nhấn để bắt đầu nói</p>
              )}
            </div>
          </div>

          {/* History */}
          {(transcripts.length > 0 || responseTexts.length > 0) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Lịch sử hội thoại</h3>
                <button
                  onClick={clearHistory}
                  className="text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  Xóa lịch sử
                </button>
              </div>
              
              <div className="max-h-64 overflow-y-auto space-y-3">
                {transcripts.map((cmd, index) => (
                  <div key={`conversation-${index}`} className="space-y-2">
                    {/* User command */}
                    <div className="flex justify-end">
                      <div className="bg-blue-500 text-white rounded-2xl rounded-br-md px-4 py-2 max-w-xs">
                        <p className="text-sm">{cmd}</p>
                      </div>
                    </div>
                    
                    {/* AI response */}
                    {responseTexts[index] && (
                      <div className="flex justify-start items-start space-x-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <Volume2 className="w-3 h-3 text-white" />
                        </div>
                        <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-2 max-w-xs">
                          <p className="text-sm text-gray-800">{responseTexts[index]}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
