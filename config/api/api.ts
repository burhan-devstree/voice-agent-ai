const API = {
  verifyOtp: "/auth/verify-otp",
  sendOtp: "/auth/send-otp",
  userFetch: "/user/me",
  startConversation: "/conversation/get-pre-signed-url",
};

Object.freeze(API);
export default API;
