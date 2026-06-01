export const publicIndexNowKey = "5017505a47f1c39b9a5799094b04c9ea";

export function indexNowKey() {
  return process.env.INDEXNOW_KEY?.trim() || publicIndexNowKey;
}
