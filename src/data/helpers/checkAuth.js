export default function checkAuth(request) {
  if (!request || !request.user) {
    throw new Error();
  }
}
