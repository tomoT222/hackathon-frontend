export const getJapaneseAuthErrorMessage = (code: string): string => {
  switch (code) {
    case 'auth/invalid-email':
      return 'メールアドレスの形式が正しくありません。';
    case 'auth/user-disabled':
      return 'このユーザーは無効化されています。';
    case 'auth/user-not-found':
      return 'ユーザーが見つかりません。メールアドレスを確認してください。';
    case 'auth/wrong-password':
      return 'パスワードが間違っています。';
    case 'auth/email-already-in-use':
      return 'このメールアドレスは既に登録されています。';
    case 'auth/weak-password':
      return 'パスワードは6文字以上で設定してください。';
    case 'auth/operation-not-allowed':
      return 'メール/パスワード認証が無効になっています。管理者に連絡してください。';
    case 'auth/popup-closed-by-user':
      return 'ログインウィンドウが閉じられました。';
    case 'auth/too-many-requests':
      return 'アクセスが多すぎます。しばらく待ってから再試行してください。';
    default:
      return `エラーが発生しました (${code})`;
  }
};
