// Mock translation data for message translation feature

export interface TranslationLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const TRANSLATION_LANGUAGES: TranslationLanguage[] = [
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
];

// Pre-built mock translations for common engineering/chat phrases
// Maps partial content matches to translations in different languages
const PHRASE_TRANSLATIONS: Record<string, Record<string, string>> = {
  // Common chat patterns - we match the beginning of the message
  'Hey team': {
    es: 'Hola equipo',
    fr: 'Salut l\'équipe',
    de: 'Hallo Team',
    ja: 'チームの皆さん',
    zh: '大家好',
    ko: '팀 여러분',
    pt: 'Olá equipe',
    ar: 'مرحباً بالفريق',
    ru: 'Привет команда',
    hi: 'नमस्ते टीम',
    it: 'Ciao squadra',
    nl: 'Hallo team',
  },
  'Good morning': {
    es: 'Buenos días',
    fr: 'Bonjour',
    de: 'Guten Morgen',
    ja: 'おはようございます',
    zh: '早上好',
    ko: '좋은 아침이에요',
    pt: 'Bom dia',
    ar: 'صباح الخير',
    ru: 'Доброе утро',
    hi: 'सुप्रभात',
    it: 'Buongiorno',
    nl: 'Goedemorgen',
  },
  'Thanks': {
    es: 'Gracias',
    fr: 'Merci',
    de: 'Danke',
    ja: 'ありがとう',
    zh: '谢谢',
    ko: '감사합니다',
    pt: 'Obrigado',
    ar: 'شكراً',
    ru: 'Спасибо',
    hi: 'धन्यवाद',
    it: 'Grazie',
    nl: 'Bedankt',
  },
};

// Full mock translation tables keyed by langCode
// These provide realistic-looking translated sentences for different content patterns
const FULL_TRANSLATIONS: Record<string, Record<string, string>> = {
  es: {
    _deployment: 'He notado alguna inestabilidad en la canalización de implementación. ¿Alguien más ha visto esto?',
    _review: '¿Alguien puede revisar mi PR? Es una corrección menor del proceso de autenticación.',
    _meeting: 'La reunión del equipo se ha movido a las 3 PM. Por favor, actualicen sus calendarios.',
    _bug: 'Encontré un error en el módulo de autenticación. Creando un ticket ahora.',
    _update: 'Actualización: la migración de la base de datos se completó con éxito. Todos los servicios están funcionando.',
    _sprint: 'Resumen del sprint: completamos 34 puntos de historia esta iteración. ¡Gran trabajo a todos!',
    _default: 'Este es un mensaje traducido. El contenido original fue procesado automáticamente.',
  },
  fr: {
    _deployment: 'J\'ai remarqué une certaine instabilité dans le pipeline de déploiement. Quelqu\'un d\'autre a vu ça?',
    _review: 'Quelqu\'un peut-il vérifier ma PR? C\'est une correction mineure du flux d\'authentification.',
    _meeting: 'La réunion d\'équipe a été déplacée à 15h. Veuillez mettre à jour vos calendriers.',
    _bug: 'J\'ai trouvé un bug dans le module d\'authentification. Création d\'un ticket maintenant.',
    _update: 'Mise à jour : la migration de la base de données s\'est terminée avec succès. Tous les services fonctionnent.',
    _sprint: 'Résumé du sprint : nous avons complété 34 points d\'histoire cette itération. Excellent travail à tous !',
    _default: 'Ceci est un message traduit. Le contenu original a été traité automatiquement.',
  },
  de: {
    _deployment: 'Ich habe eine gewisse Instabilität in der Bereitstellungspipeline festgestellt. Hat das noch jemand bemerkt?',
    _review: 'Kann jemand meinen PR überprüfen? Es ist eine kleine Korrektur des Authentifizierungsflusses.',
    _meeting: 'Das Teammeeting wurde auf 15 Uhr verschoben. Bitte aktualisiert eure Kalender.',
    _bug: 'Ich habe einen Fehler im Authentifizierungsmodul gefunden. Erstelle jetzt ein Ticket.',
    _update: 'Update: Die Datenbankmigration wurde erfolgreich abgeschlossen. Alle Dienste laufen.',
    _sprint: 'Sprint-Zusammenfassung: Wir haben diese Iteration 34 Story Points abgeschlossen. Großartige Arbeit!',
    _default: 'Dies ist eine übersetzte Nachricht. Der Originalinhalt wurde automatisch verarbeitet.',
  },
  ja: {
    _deployment: 'デプロイメントパイプラインに不安定さが見られます。他に誰か気づいた方はいますか？',
    _review: '私のPRをレビューしていただけますか？認証フローの軽微な修正です。',
    _meeting: 'チームミーティングが午後3時に変更されました。カレンダーの更新をお願いします。',
    _bug: '認証モジュールにバグを見つけました。今チケットを作成しています。',
    _update: '更新：データベースの移行が正常に完了しました。すべてのサービスが稼働中です。',
    _sprint: 'スプリントまとめ：今回のイテレーションで34ストーリーポイントを完了しました。素晴らしい仕事です！',
    _default: 'これは翻訳されたメッセージです。元の内容は自動的に処理されました。',
  },
  zh: {
    _deployment: '我注意到部署管道有一些不稳定。其他人也遇到这个问题了吗？',
    _review: '有人可以审查我的PR吗？这是身份验证流程的一个小修复。',
    _meeting: '团队会议已改到下午3点。请更新你们的日历。',
    _bug: '我在认证模块中发现了一个bug。正在创建工单。',
    _update: '更新：数据库迁移已成功完成。所有服务运行正常。',
    _sprint: '冲刺总结：本次迭代完成了34个故事点。大家做得很好！',
    _default: '这是一条已翻译的消息。原始内容已自动处理。',
  },
  ko: {
    _deployment: '배포 파이프라인에서 불안정성을 발견했습니다. 다른 분들도 이 문제를 보셨나요?',
    _review: '제 PR을 검토해 주실 수 있나요? 인증 플로우의 사소한 수정입니다.',
    _meeting: '팀 미팅이 오후 3시로 변경되었습니다. 캘린더를 업데이트해 주세요.',
    _bug: '인증 모듈에서 버그를 발견했습니다. 지금 티켓을 생성하고 있습니다.',
    _update: '업데이트: 데이터베이스 마이그레이션이 성공적으로 완료되었습니다. 모든 서비스가 정상 운영 중입니다.',
    _sprint: '스프린트 요약: 이번 반복에서 34개의 스토리 포인트를 완료했습니다. 모두 수고하셨습니다!',
    _default: '이것은 번역된 메시지입니다. 원본 콘텐츠가 자동으로 처리되었습니다.',
  },
  pt: {
    _deployment: 'Notei alguma instabilidade no pipeline de implantação. Alguém mais viu isso?',
    _review: 'Alguém pode revisar meu PR? É uma correção menor no fluxo de autenticação.',
    _meeting: 'A reunião da equipe foi movida para as 15h. Por favor, atualizem seus calendários.',
    _bug: 'Encontrei um bug no módulo de autenticação. Criando um ticket agora.',
    _update: 'Atualização: a migração do banco de dados foi concluída com sucesso. Todos os serviços estão funcionando.',
    _sprint: 'Resumo do sprint: completamos 34 pontos de história nesta iteração. Ótimo trabalho!',
    _default: 'Esta é uma mensagem traduzida. O conteúdo original foi processado automaticamente.',
  },
  ar: {
    _deployment: 'لاحظت بعض عدم الاستقرار في خط أنابيب النشر. هل لاحظ أي شخص آخر ذلك؟',
    _review: 'هل يمكن لشخص ما مراجعة طلب السحب الخاص بي؟ إنه إصلاح بسيط لتدفق المصادقة.',
    _meeting: 'تم نقل اجتماع الفريق إلى الساعة 3 مساءً. يرجى تحديث التقويمات الخاصة بكم.',
    _bug: 'وجدت خطأ في وحدة المصادقة. أقوم بإنشاء تذكرة الآن.',
    _update: 'تحديث: اكتملت ترحيل قاعدة البيانات بنجاح. جميع الخدمات تعمل.',
    _sprint: 'ملخص السبرنت: أكملنا 34 نقطة قصة في هذه الدورة. عمل رائع للجميع!',
    _default: 'هذه رسالة مترجمة. تمت معالجة المحتوى الأصلي تلقائياً.',
  },
  ru: {
    _deployment: 'Я заметил некоторую нестабильность в конвейере развертывания. Кто-нибудь еще это видел?',
    _review: 'Может кто-нибудь проверить мой PR? Это небольшое исправление потока аутентификации.',
    _meeting: 'Командная встреча перенесена на 15:00. Пожалуйста, обновите свои календари.',
    _bug: 'Я нашел баг в модуле аутентификации. Создаю тикет сейчас.',
    _update: 'Обновление: миграция базы данных успешно завершена. Все сервисы работают.',
    _sprint: 'Итоги спринта: в этой итерации мы завершили 34 стори-поинта. Отличная работа!',
    _default: 'Это переведённое сообщение. Оригинальное содержание было обработано автоматически.',
  },
  hi: {
    _deployment: 'मैंने डिप्लॉयमेंट पाइपलाइन में कुछ अस्थिरता देखी है। क्या किसी और ने यह देखा?',
    _review: 'क्या कोई मेरा PR रिव्यू कर सकता है? यह ऑथेंटिकेशन फ्लो का एक छोटा फिक्स है।',
    _meeting: 'टीम मीटिंग दोपहर 3 बजे कर दी गई है। कृपया अपने कैलेंडर अपडेट करें।',
    _bug: 'मुझे ऑथेंटिकेशन मॉड्यूल में एक बग मिला। अभी टिकट बना रहा हूं।',
    _update: 'अपडेट: डेटाबेस माइग्रेशन सफलतापूर्वक पूरा हुआ। सभी सेवाएं चल रही हैं।',
    _sprint: 'स्प्रिंट सारांश: इस इटरेशन में हमने 34 स्टोरी पॉइंट पूरे किए। शानदार काम!',
    _default: 'यह एक अनुवादित संदेश है। मूल सामग्री स्वचालित रूप से संसाधित की गई थी।',
  },
  it: {
    _deployment: 'Ho notato una certa instabilità nella pipeline di distribuzione. Qualcun altro ha visto questo?',
    _review: 'Qualcuno può controllare la mia PR? È una correzione minore del flusso di autenticazione.',
    _meeting: 'La riunione del team è stata spostata alle 15:00. Per favore aggiornate i vostri calendari.',
    _bug: 'Ho trovato un bug nel modulo di autenticazione. Sto creando un ticket ora.',
    _update: 'Aggiornamento: la migrazione del database è stata completata con successo. Tutti i servizi funzionano.',
    _sprint: 'Riepilogo sprint: abbiamo completato 34 story point in questa iterazione. Ottimo lavoro!',
    _default: 'Questo è un messaggio tradotto. Il contenuto originale è stato elaborato automaticamente.',
  },
  nl: {
    _deployment: 'Ik heb enige instabiliteit in de deployment-pipeline opgemerkt. Heeft iemand anders dit ook gezien?',
    _review: 'Kan iemand mijn PR bekijken? Het is een kleine fix van de authenticatiestroom.',
    _meeting: 'De teamvergadering is verplaatst naar 15:00 uur. Werk alsjeblieft je agenda bij.',
    _bug: 'Ik heb een bug gevonden in de authenticatiemodule. Ik maak nu een ticket aan.',
    _update: 'Update: de databasemigratie is succesvol voltooid. Alle services draaien.',
    _sprint: 'Sprintsamenvatting: we hebben 34 story points voltooid in deze iteratie. Geweldig werk!',
    _default: 'Dit is een vertaald bericht. De originele inhoud is automatisch verwerkt.',
  },
};

/**
 * Detect the best translation category for a given message content.
 */
function detectCategory(content: string): string {
  const lower = content.toLowerCase();
  if (lower.includes('deploy') || lower.includes('pipeline') || lower.includes('ci/cd') || lower.includes('release'))
    return '_deployment';
  if (lower.includes('review') || lower.includes('pr') || lower.includes('pull request') || lower.includes('code review'))
    return '_review';
  if (lower.includes('meeting') || lower.includes('standup') || lower.includes('sync') || lower.includes('calendar'))
    return '_meeting';
  if (lower.includes('bug') || lower.includes('error') || lower.includes('crash') || lower.includes('fix'))
    return '_bug';
  if (lower.includes('update') || lower.includes('migration') || lower.includes('database') || lower.includes('complete'))
    return '_update';
  if (lower.includes('sprint') || lower.includes('story point') || lower.includes('iteration') || lower.includes('velocity'))
    return '_sprint';
  return '_default';
}

/**
 * Mock translation function.
 * Returns a Promise to simulate API latency.
 */
export function mockTranslate(
  content: string,
  targetLang: string,
): Promise<{ translatedText: string; detectedSourceLang: string }> {
  return new Promise((resolve) => {
    // Simulate network delay (300-800ms)
    const delay = 300 + Math.random() * 500;

    setTimeout(() => {
      // Check for known phrase translations first
      for (const [phrase, translations] of Object.entries(PHRASE_TRANSLATIONS)) {
        if (content.startsWith(phrase) && translations[targetLang]) {
          // Replace the matched phrase and append the rest
          const rest = content.slice(phrase.length);
          const translated = translations[targetLang];
          // If the rest is significant, append a translated version from the category
          if (rest.trim().length > 10) {
            const category = detectCategory(rest);
            const fullTranslation = FULL_TRANSLATIONS[targetLang]?.[category] || FULL_TRANSLATIONS[targetLang]?._default;
            resolve({
              translatedText: `${translated}. ${fullTranslation || content}`,
              detectedSourceLang: 'en',
            });
            return;
          }
          resolve({
            translatedText: translated + rest,
            detectedSourceLang: 'en',
          });
          return;
        }
      }

      // Use category-based translation
      const category = detectCategory(content);
      const langTranslations = FULL_TRANSLATIONS[targetLang];
      if (langTranslations) {
        const translated = langTranslations[category] || langTranslations._default;
        resolve({
          translatedText: translated || content,
          detectedSourceLang: 'en',
        });
        return;
      }

      // Fallback: return original with a note
      resolve({
        translatedText: content,
        detectedSourceLang: 'en',
      });
    }, delay);
  });
}
