/**
 * Legal Content Utility
 * Contains Privacy Policy and Terms of Service content
 * for better code organization and maintainability
 * Now supports multiple languages: English, Spanish, Portuguese (BR)
 */

// ✅ Multi-language legal content
const LEGAL_CONTENT = {
  en: {
    privacyPolicy: {
      title: 'Privacy Policy',
      content: `📋 OkanAssist Privacy Policy

🔒 Data Collection:
• We collect only essential data to provide our financial tracking services
• Personal information: Name, email, and preferences
• Financial data: Transactions, categories, and reminders you create
• Usage data: App interactions for improvement purposes

🛡️ Data Protection:
• All data is encrypted and stored securely on Supabase servers
• We use industry-standard security measures
• Your financial data is never shared with third parties
• No advertising or tracking cookies

📱 Data Usage:
• Personal data is used solely to provide app functionality
• Anonymous usage statistics help improve the app
• We may send important service updates via email
• No data is sold or shared for marketing purposes

🔄 Your Rights:
• Export your data anytime via Settings
• Delete your account and all data permanently
• Request data corrections through support
• Opt-out of non-essential communications

📊 Data Retention:
• Transaction data is kept until you delete your account
• Backup data is automatically purged after 30 days
• Log files are retained for security purposes for up to 90 days
• Account deletion removes all data within 30 days

🌍 International Transfers:
• Data is stored on Supabase servers (hosted on AWS)
• We comply with GDPR and international privacy standards
• Data transfers are protected by appropriate safeguards

📞 Contact & Support:
• For privacy concerns, contact us through the Telegram bot
• Email support for data requests and questions
• Response time: 24-48 hours for privacy inquiries

Last updated: ${new Date().toLocaleDateString()}
Version: 1.0`
    },
    termsOfService: {
      title: 'Terms of Service',
      content: `📜 OkanAssist Terms of Service

✅ Acceptance of Terms:
By using OkanAssist, you agree to these terms and our Privacy Policy.
These terms constitute a legally binding agreement between you and OkanAssist.

🎯 Service Description:
• OkanAssist is a personal finance tracking application
• Helps you manage transactions, expenses, and reminders
• Provides data visualization and export capabilities
• Available on mobile devices with cloud synchronization
• Includes AI-powered insights and spending analysis

👤 User Responsibilities:
• Provide accurate information for your account
• Keep your login credentials secure
• Use the app only for personal financial tracking
• Don't share accounts or violate others' privacy
• Report bugs or security issues promptly
• Ensure your device meets minimum requirements

🚫 Prohibited Uses:
• Commercial use without written permission
• Attempting to hack, reverse engineer, or exploit the app
• Uploading malicious content or spam
• Violating applicable laws or regulations
• Using the service to track others' finances without consent
• Automated data scraping or bulk operations

💰 Service Availability:
• The app is currently free to use
• We reserve the right to introduce paid features
• Service availability may vary by region
• We aim for 99.9% uptime but don't guarantee it
• Scheduled maintenance will be announced in advance

⚖️ Limitation of Liability:
• Use the app at your own risk
• We're not liable for financial decisions based on app data
• Always verify important financial information
• Keep backups of critical data
• Maximum liability limited to service fees paid (if any)

🔄 Changes to Terms:
• We may update these terms with advance notice
• Continued use implies acceptance of new terms
• Major changes will be communicated via the app
• You may discontinue use if you disagree with changes

📞 Support & Contact:
Contact us through the Telegram bot for assistance.
Email: okanfit.ai@gmail.com
Response time: 24-48 hours

Version 1.0 - Effective: ${new Date().toLocaleDateString()}
Governed by the laws of your jurisdiction`
    }
  },

  es: {
    privacyPolicy: {
      title: 'Política de Privacidad',
      content: `📋 Política de Privacidad de OkanAssist

🔒 Recopilación de Datos:
• Recopilamos solo los datos esenciales para proporcionar nuestros servicios de seguimiento financiero
• Información personal: Nombre, correo electrónico y preferencias
• Datos financieros: Transacciones, categorías y recordatorios que crees
• Datos de uso: Interacciones con la aplicación para fines de mejora

🛡️ Protección de Datos:
• Todos los datos están cifrados y almacenados de forma segura en servidores de Supabase
• Utilizamos medidas de seguridad estándar de la industria
• Tus datos financieros nunca se comparten con terceros
• Sin publicidad ni cookies de seguimiento

📱 Uso de Datos:
• Los datos personales se usan únicamente para proporcionar funcionalidad de la aplicación
• Las estadísticas de uso anónimas nos ayudan a mejorar la aplicación
• Podemos enviar actualizaciones importantes del servicio por correo electrónico
• No se venden ni comparten datos con fines de marketing

🔄 Tus Derechos:
• Exporta tus datos en cualquier momento a través de Configuración
• Elimina tu cuenta y todos los datos permanentemente
• Solicita correcciones de datos a través del soporte
• Optar por no recibir comunicaciones no esenciales

📊 Retención de Datos:
• Los datos de transacciones se conservan hasta que elimines tu cuenta
• Los datos de respaldo se purgan automáticamente después de 30 días
• Los archivos de registro se conservan por motivos de seguridad hasta 90 días
• La eliminación de cuenta elimina todos los datos dentro de 30 días

🌍 Transferencias Internacionales:
• Los datos se almacenan en servidores de Supabase (alojados en AWS)
• Cumplimos con GDPR y estándares internacionales de privacidad
• Las transferencias de datos están protegidas por salvaguardas apropiadas

📞 Contacto y Soporte:
• Para inquietudes de privacidad, contáctanos a través del bot de Telegram
• Soporte por correo electrónico para solicitudes de datos y preguntas
• Tiempo de respuesta: 24-48 horas para consultas de privacidad

Última actualización: ${new Date().toLocaleDateString()}
Versión: 1.0`
    },
    termsOfService: {
      title: 'Términos de Servicio',
      content: `📜 Términos de Servicio de OkanAssist

✅ Aceptación de Términos:
Al usar OkanAssist, aceptas estos términos y nuestra Política de Privacidad.
Estos términos constituyen un acuerdo legalmente vinculante entre tú y OkanAssist.

🎯 Descripción del Servicio:
• OkanAssist es una aplicación de seguimiento de finanzas personales
• Ayuda a gestionar transacciones, gastos y recordatorios
• Proporciona visualización de datos y capacidades de exportación
• Disponible en dispositivos móviles con sincronización en la nube
• Incluye insights y análisis de gastos impulsados por IA

👤 Responsabilidades del Usuario:
• Proporcionar información precisa para tu cuenta
• Mantener seguras tus credenciales de inicio de sesión
• Usar la aplicación solo para seguimiento financiero personal
• No compartir cuentas ni violar la privacidad de otros
• Reportar errores o problemas de seguridad prontamente
• Asegurar que tu dispositivo cumple los requisitos mínimos

🚫 Usos Prohibidos:
• Uso comercial sin permiso escrito
• Intentar hackear, ingeniería inversa o explotar la aplicación
• Subir contenido malicioso o spam
• Violar leyes o regulaciones aplicables
• Usar el servicio para rastrear finanzas de otros sin consentimiento
• Extracción automatizada de datos u operaciones masivas

💰 Disponibilidad del Servicio:
• La aplicación es actualmente gratuita
• Nos reservamos el derecho de introducir características de pago
• La disponibilidad del servicio puede variar por región
• Aspiramos a 99.9% de tiempo activo pero no lo garantizamos
• El mantenimiento programado se anunciará con anticipación

⚖️ Limitación de Responsabilidad:
• Usa la aplicación bajo tu propio riesgo
• No somos responsables por decisiones financieras basadas en datos de la aplicación
• Siempre verifica información financiera importante
• Mantén respaldos de datos críticos
• Responsabilidad máxima limitada a tarifas de servicio pagadas (si las hay)

🔄 Cambios a los Términos:
• Podemos actualizar estos términos con aviso previo
• El uso continuado implica aceptación de nuevos términos
• Los cambios importantes se comunicarán a través de la aplicación
• Puedes discontinuar el uso si no estás de acuerdo con los cambios

📞 Soporte y Contacto:
Contáctanos a través del bot de Telegram para asistencia.
Correo: okanfit.ai@gmail.com
Tiempo de respuesta: 24-48 horas

Versión 1.0 - Efectivo: ${new Date().toLocaleDateString()}
Regido por las leyes de tu jurisdicción`
    }
  },

  pt: {
    privacyPolicy: {
      title: 'Política de Privacidade',
      content: `📋 Política de Privacidade do OkanAssist

🔒 Coleta de Dados:
• Coletamos apenas dados essenciais para fornecer nossos serviços de rastreamento financeiro
• Informações pessoais: Nome, e-mail e preferências
• Dados financeiros: Transações, categorias e lembretes que você criar
• Dados de uso: Interações com o aplicativo para fins de melhoria

🛡️ Proteção de Dados:
• Todos os dados são criptografados e armazenados com segurança em servidores Supabase
• Utilizamos medidas de segurança padrão da indústria
• Seus dados financeiros nunca são compartilhados com terceiros
• Sem publicidade ou cookies de rastreamento

📱 Uso de Dados:
• Dados pessoais são usados exclusivamente para fornecer funcionalidade do aplicativo
• Estatísticas de uso anônimas nos ajudam a melhorar o aplicativo
• Podemos enviar atualizações importantes do serviço por e-mail
• Nenhum dado é vendido ou compartilhado para fins de marketing

🔄 Seus Direitos:
• Exporte seus dados a qualquer momento através das Configurações
• Delete sua conta e todos os dados permanentemente
• Solicite correções de dados através do suporte
• Opte por não receber comunicações não essenciais

📊 Retenção de Dados:
• Dados de transações são mantidos até você deletar sua conta
• Dados de backup são automaticamente removidos após 30 dias
• Arquivos de log são mantidos por motivos de segurança por até 90 dias
• Exclusão da conta remove todos os dados dentro de 30 dias

🌍 Transferências Internacionais:
• Dados são armazenados em servidores Supabase (hospedados na AWS)
• Cumprimos com LGPD e padrões internacionais de privacidade
• Transferências de dados são protegidas por salvaguardas apropriadas

📞 Contato e Suporte:
• Para questões de privacidade, entre em contato através do bot do Telegram
• Suporte por e-mail para solicitações de dados e perguntas
• Tempo de resposta: 24-48 horas para consultas de privacidade

Última atualização: ${new Date().toLocaleDateString()}
Versão: 1.0`
    },
    termsOfService: {
      title: 'Termos de Serviço',
      content: `📜 Termos de Serviço do OkanAssist

✅ Aceitação dos Termos:
Ao usar o OkanAssist, você concorda com estes termos e nossa Política de Privacidade.
Estes termos constituem um acordo legalmente vinculativo entre você e o OkanAssist.

🎯 Descrição do Serviço:
• OkanAssist é um aplicativo de rastreamento de finanças pessoais
• Ajuda a gerenciar transações, despesas e lembretes
• Fornece visualização de dados e capacidades de exportação
• Disponível em dispositivos móveis com sincronização na nuvem
• Inclui insights e análise de gastos alimentados por IA

👤 Responsabilidades do Usuário:
• Fornecer informações precisas para sua conta
• Manter suas credenciais de login seguras
• Usar o aplicativo apenas para rastreamento financeiro pessoal
• Não compartilhar contas ou violar a privacidade de outros
• Reportar bugs ou problemas de segurança prontamente
• Garantir que seu dispositivo atenda aos requisitos mínimos

🚫 Usos Proibidos:
• Uso comercial sem permissão por escrito
• Tentar hackear, fazer engenharia reversa ou explorar o aplicativo
• Enviar conteúdo malicioso ou spam
• Violar leis ou regulamentações aplicáveis
• Usar o serviço para rastrear finanças de outros sem consentimento
• Extração automatizada de dados ou operações em massa

💰 Disponibilidade do Serviço:
• O aplicativo é atualmente gratuito para usar
• Reservamos o direito de introduzir recursos pagos
• Disponibilidade do serviço pode variar por região
• Almejamos 99.9% de tempo ativo mas não garantimos
• Manutenção programada será anunciada com antecedência

⚖️ Limitação de Responsabilidade:
• Use o aplicativo por sua própria conta e risco
• Não somos responsáveis por decisões financeiras baseadas em dados do aplicativo
• Sempre verifique informações financeiras importantes
• Mantenha backups de dados críticos
• Responsabilidade máxima limitada a taxas de serviço pagas (se houver)

🔄 Mudanças nos Termos:
• Podemos atualizar estes termos com aviso prévio
• Uso continuado implica aceitação de novos termos
• Mudanças importantes serão comunicadas através do aplicativo
• Você pode descontinuar o uso se discordar das mudanças

📞 Suporte e Contato:
Entre em contato através do bot do Telegram para assistência.
E-mail: okanfit.ai@gmail.com
Tempo de resposta: 24-48 horas

Versão 1.0 - Efetivo: ${new Date().toLocaleDateString()}
Regido pelas leis de sua jurisdição`
    }
  }
};

// ✅ Get legal content based on current language
export const getLegalContent = (t, language = 'en') => {
  // Fallback to English if language not supported
  const langCode = ['en', 'es', 'pt'].includes(language) ? language : 'en';
  const content = LEGAL_CONTENT[langCode];
  
  return {
    privacyPolicy: {
      title: content.privacyPolicy.title,
      content: content.privacyPolicy.content
    },
    termsOfService: {
      title: content.termsOfService.title,
      content: content.termsOfService.content
    }
  };
};

// ✅ React Native component versions for scrollable modals
export const getScrollableLegalContent = (t, colors, typography, spacing, language = 'en') => {
  const langCode = ['en', 'es', 'pt'].includes(language) ? language : 'en';
  const content = LEGAL_CONTENT[langCode];
  
  return {
    PrivacyPolicyContent: ({ style }) => {
      const React = require('react');
      const { ScrollView, Text } = require('react-native');
      
      return (
        <ScrollView style={[{ maxHeight: 400 }, style]} showsVerticalScrollIndicator={true}>
          <Text style={{
            fontSize: typography.fontSize.base,
            color: colors.textPrimary,
            lineHeight: 24,
            padding: spacing.md
          }}>
            {content.privacyPolicy.content}
          </Text>
        </ScrollView>
      );
    },

    TermsOfServiceContent: ({ style }) => {
      const React = require('react');
      const { ScrollView, Text } = require('react-native');
      
      return (
        <ScrollView style={[{ maxHeight: 400 }, style]} showsVerticalScrollIndicator={true}>
          <Text style={{
            fontSize: typography.fontSize.base,
            color: colors.textPrimary,
            lineHeight: 24,
            padding: spacing.md
          }}>
            {content.termsOfService.content}
          </Text>
        </ScrollView>
      );
    }
  };
};

// ✅ Configuration for legal content versioning
export const LEGAL_CONFIG = {
  version: '1.0',
  lastUpdated: new Date().toISOString().split('T')[0],
  contact: {
    email: 'okanfit.ai@gmail.com',
    telegram: '@okassist_bot',
    responseTime: '24-48 hours'
  },
  jurisdiction: 'International',
  compliance: ['GDPR', 'CCPA', 'LGPD'],
  supportedLanguages: ['en', 'es', 'pt']
};

// ✅ Helper function to show legal content in alerts - now language-aware
export const showLegalAlert = (type, t, language = 'en') => {
  const { Alert } = require('react-native');
  const content = getLegalContent(t, language);
  
  if (type === 'privacy') {
    Alert.alert(
      content.privacyPolicy.title,
      content.privacyPolicy.content,
      [{ text: t('close') || 'Close', style: 'default' }],
      { cancelable: true }
    );
  } else if (type === 'terms') {
    Alert.alert(
      content.termsOfService.title,
      content.termsOfService.content,
      [{ text: t('close') || 'Close', style: 'default' }],
      { cancelable: true }
    );
  }
};

// ✅ Helper to get localized legal text snippets
export const getLegalTextSnippets = (language = 'en') => {
  const snippets = {
    en: {
      dataProtected: "Your data is protected",
      gdprCompliant: "GDPR Compliant",
      secureStorage: "Secure Storage",
      noThirdParty: "No Third-Party Sharing"
    },
    es: {
      dataProtected: "Tus datos están protegidos",
      gdprCompliant: "Cumple con GDPR",
      secureStorage: "Almacenamiento Seguro",
      noThirdParty: "Sin Compartir con Terceros"
    },
    pt: {
      dataProtected: "Seus dados estão protegidos",
      gdprCompliant: "Conforme LGPD",
      secureStorage: "Armazenamento Seguro",
      noThirdParty: "Sem Compartilhamento com Terceiros"
    }
  };
  
  const langCode = ['en', 'es', 'pt'].includes(language) ? language : 'en';
  return snippets[langCode];
};