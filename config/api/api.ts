const API = {
  sendOtp: "/auth/send-otp",
  verifyOtp: "/auth/verify-otp",
  fetchMe: "/user/me",
  startConversation: "/conversation/get-pre-signed-url",
};

Object.freeze(API);
export default API;

