// 新しい架電前フェーズ用のデータ構造
export interface AttributeInfo {
  id: string;
  priority: '必須' | '推奨';
  title: string;
  content: string;
  details?: string[];
}

export interface TransactionInfo {
  id: string;
  priority: '必須' | '推奨';
  title: string;
  content: string;
  details: string[];
}

export interface ContactHistory {
  id: string;
  date: string;
  time: string;
  method: string;
  content: string;
}

export interface Tip {
  id: string;
  content: string;
}

export interface PreCallPhaseDataNew {
  attributeInfo: AttributeInfo[];
  transactionInfo: TransactionInfo[];
  contactHistory: ContactHistory[];
  tips: Tip[];
}

// サンプルデータ
export const samplePreCallPhaseData: PreCallPhaseDataNew = {
  attributeInfo: [
    {
      id: "attr_1",
      priority: "必須",
      title: "自宅不明",
      content: "自宅不明のお客様です。お客様に自宅情報を確認してください。"
    }
  ],
  transactionInfo: [
    {
      id: "trans_1",
      priority: "必須",
      title: "口座振替説明",
      content: "口座振替が完了していないお客様です。次の点を案内・確認してください。",
      details: [
        "再度の口座振替はできない事を案内し、お客様自身で返済頂く必要がある事を説明してください。",
        "口座振替以外の支払方法を確認してください。",
        "支払予定日と金額を確認してください。",
        "振替日前の支払では期日が更新されない事を説明してください。"
      ]
    }
  ],
  contactHistory: [
    {
      id: "contact_1",
      date: "7/28",
      time: "〇〇：〇〇",
      method: "勤務先",
      content: "会話都合悪く7/28折り返し連絡約束も履行されず"
    },
    {
      id: "contact_2",
      date: "6/25",
      time: "〇〇：〇〇",
      method: "携帯",
      content: "6/30一時約束も履行されず。近日中に引越し予定情報あり。"
    },
    {
      id: "contact_3",
      date: "1/25",
      time: "〇〇：〇〇",
      method: "勤務先",
      content: "1/26一時約束も履行されず"
    }
  ],
  tips: [
    {
      id: "tip_1",
      content: "（コンタクト履歴より）お客様の都合を確認し、充分な相談時間を取る事に努めてください"
    },
    {
      id: "tip_2",
      content: "「属性情報」「取引内容」の確認・説明を行ってください"
    },
    {
      id: "tip_3",
      content: "今年に入り取引が悪化しています。お客様の事情・延滞理由の把握に努めてください"
    }
  ]
};