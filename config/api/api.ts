const API = {
  verifyOtp: "/auth/verify-otp",
  sendOtp: "/auth/send-otp",
  userFetch: "/users/me",
  startConversation: "/ws/start-conversation",
};

Object.freeze(API);
export default API;
