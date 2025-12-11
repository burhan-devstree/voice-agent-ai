import usePostData from "../use-post-data";
import API from "@/config/api/api";
import {
  VerifyOtpRequest,
  VerifyOtpResponse,
  OnSuccessCallback,
  OnErrorCallback,
} from "@/types/api";

export const useVerifyOtp = (
  onSuccess: OnSuccessCallback<VerifyOtpResponse>,
  onError: OnErrorCallback
) => {
  return usePostData<VerifyOtpResponse, VerifyOtpRequest>({
    url: API.verifyOtp,
    onSuccess,
    onError,
  });
};
