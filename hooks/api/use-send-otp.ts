import usePostData from "../use-post-data";
import API from "@/config/api/api";
import {
  SendOtpRequest,
  SendOtpResponse,
  OnSuccessCallback,
  OnErrorCallback,
} from "@/types/api";

export const useSendOtp = (
  onSuccess: OnSuccessCallback<SendOtpResponse>,
  onError: OnErrorCallback
) => {
  return usePostData<SendOtpResponse, SendOtpRequest>({
    url: API.sendOtp,
    onSuccess,
    onError,
  });
};
