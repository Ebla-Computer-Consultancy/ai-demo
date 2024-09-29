const endpoint = 'http://localhost:7071/api/v1/';
const deployedEndpoint = 'https://ebla-ai-demo-002.azurewebsites.net/api/v1/';
const reraEndpoint = 'https://rera-api.azurewebsites.net/api/v1/';

const qatardiarLogo =
    'https://www.qataridiar.com/themes/custom/qataridiar/logo.svg';
const meccLogo =
    'assets/images/Primary-Logo-Bilingual-RGB_Ministry-of-Environment-and-Climate-Change.png';
const qrepLogo = 'assets/images/qrep-newlogo-colored.png';
export const environment = {
    production: true,
    endpoint: deployedEndpoint,
    debugMode: false,
    logo: qatardiarLogo,
    STREAM_ID_STORAGE_KEY: 'streamId',
    MESSAGE_TEXT_KEY: 'message_text',
    AVATAR_IS_RECORDING_KEY: 'is_recording',
    OUTER_AVATAR_IS_ACTIVE_KEY: 'is_active_outer_avatar',
    base: '/ai-demo',
};
