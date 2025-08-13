export interface SpeechRecognitionResult {
    transcript: string;
    confidence: number;
    language: string;
    duration: number;
}

export interface SpeechRecognitionOptions {
    language?: string;
    model?: string;
    enableAutomaticPunctuation?: boolean;
    enableWordTimeOffsets?: boolean;
}

export class GoogleSpeechService {
    private projectId: string;
    private privateKey: string;
    private clientEmail: string;
    private clientId: string;

    constructor() {
        this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || '';
        this.privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY || '';
        this.clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL || '';
        this.clientId = process.env.GOOGLE_CLOUD_CLIENT_ID || '';

        if (!this.projectId || !this.privateKey || !this.clientEmail) {
            throw new Error('Google Cloud credentials are not properly configured');
        }
    }

    /**
     * 音声ファイルを文字起こし
     */
    async transcribeAudio(
        audioContent: Buffer,
        options: SpeechRecognitionOptions = {}
    ): Promise<SpeechRecognitionResult> {
        try {
            const accessToken = await this.getAccessToken();

            const response = await fetch(
                `https://speech.googleapis.com/v1/speech:recognize?key=${accessToken}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        config: {
                            encoding: 'LINEAR16',
                            sampleRateHertz: 16000,
                            languageCode: options.language || 'ja-JP',
                            model: options.model || 'latest_long',
                            enableAutomaticPunctuation: options.enableAutomaticPunctuation ?? true,
                            enableWordTimeOffsets: options.enableWordTimeOffsets ?? false,
                        },
                        audio: {
                            content: audioContent.toString('base64'),
                        },
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`Google Speech API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const result = data.results?.[0];

            if (!result) {
                throw new Error('No transcription result from Google Speech API');
            }

            return {
                transcript: result.alternatives[0]?.transcript || '',
                confidence: result.alternatives[0]?.confidence || 0,
                language: options.language || 'ja-JP',
                duration: this.calculateDuration(audioContent),
            };
        } catch (error) {
            console.error('Google Speech API error:', error);
            throw new Error('Failed to transcribe audio');
        }
    }

    /**
     * リアルタイム音声認識（WebRTC対応）
     */
    async transcribeStream(
        audioStream: MediaStream,
        options: SpeechRecognitionOptions = {}
    ): Promise<SpeechRecognitionResult> {
        try {
            // WebRTCのMediaStreamを処理
            const mediaRecorder = new MediaRecorder(audioStream);
            const audioChunks: Blob[] = [];

            return new Promise((resolve, reject) => {
                mediaRecorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = async () => {
                    try {
                        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                        const arrayBuffer = await audioBlob.arrayBuffer();
                        const audioBuffer = Buffer.from(arrayBuffer);

                        const result = await this.transcribeAudio(audioBuffer, options);
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                };

                mediaRecorder.start();

                // 5秒後に停止（実際の実装では適切なタイミングで制御）
                setTimeout(() => {
                    mediaRecorder.stop();
                }, 5000);
            });
        } catch (error) {
            console.error('Stream transcription error:', error);
            throw new Error('Failed to transcribe audio stream');
        }
    }

    /**
     * Google Cloud認証トークンの取得
     */
    private async getAccessToken(): Promise<string> {
        try {
            // 実際の実装では、Google Cloud SDKを使用してJWTトークンを生成
            // ここでは簡略化のため、環境変数から直接取得
            const credentials = {
                type: 'service_account',
                project_id: this.projectId,
                private_key_id: this.clientId,
                private_key: this.privateKey,
                client_email: this.clientEmail,
                client_id: this.clientId,
            };

            // JWTトークンの生成（実際の実装ではgoogle-auth-libraryを使用）
            // 簡略化のため、環境変数から直接取得
            return process.env.GOOGLE_CLOUD_API_KEY || '';
        } catch (error) {
            console.error('Failed to get access token:', error);
            throw new Error('Authentication failed');
        }
    }

    /**
     * 音声ファイルの長さを計算（概算）
     */
    private calculateDuration(audioContent: Buffer): number {
        // 16kHz, 16bit, モノラルの場合の概算
        const sampleRate = 16000;
        const bitsPerSample = 16;
        const channels = 1;
        const bytesPerSecond = (sampleRate * bitsPerSample * channels) / 8;

        return audioContent.length / bytesPerSecond;
    }
}
