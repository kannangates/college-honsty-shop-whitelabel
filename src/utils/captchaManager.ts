
export interface CaptchaChallenge {
  id: string;
  question: string;
  answer: number;
  type: 'math' | 'text';
}

export class CaptchaManager {
  private static instance: CaptchaManager;

  static getInstance(): CaptchaManager {
    if (!CaptchaManager.instance) {
      CaptchaManager.instance = new CaptchaManager();
    }
    return CaptchaManager.instance;
  }

  generateMathChallenge(): CaptchaChallenge {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let answer: number;
    let question: string;
    
    switch (operation) {
      case '+':
        answer = num1 + num2;
        question = `${num1} + ${num2} = ?`;
        break;
      case '-':
        answer = Math.max(num1, num2) - Math.min(num1, num2);
        question = `${Math.max(num1, num2)} - ${Math.min(num1, num2)} = ?`;
        break;
      case '*':
        answer = num1 * num2;
        question = `${num1} × ${num2} = ?`;
        break;
      default:
        answer = num1 + num2;
        question = `${num1} + ${num2} = ?`;
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      question,
      answer,
      type: 'math'
    };
  }

  validateChallenge(challengeId: string, userAnswer: number, correctAnswer: number): boolean {
    return userAnswer === correctAnswer;
  }

  async verifyCaptcha(token: string, challenge: CaptchaChallenge, userAnswer: number): Promise<boolean> {
    try {
      // Validate the math challenge
      const isValid = this.validateChallenge(challenge.id, userAnswer, challenge.answer);
      
      if (!isValid) {
        return false;
      }

      // Additional verification logic can be added here
      // For now, we'll just validate the math challenge
      
      return true;
    } catch (error) {
      console.error('CAPTCHA verification failed:', error);
      return false;
    }
  }

  // Method to handle any type of verification data
  async handleVerification(data: Record<string, unknown>): Promise<boolean> {
    try {
      // Handle different types of verification data
      if (typeof data.answer === 'number' && typeof data.expected === 'number') {
        return data.answer === data.expected;
      }
      
      // Add more verification logic as needed
      return false;
    } catch (error) {
      console.error('Verification handling failed:', error);
      return false;
    }
  }
}
