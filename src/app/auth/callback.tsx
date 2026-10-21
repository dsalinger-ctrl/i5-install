import { Redirect } from 'expo-router';

/** Google sign-in returns here. The auth sheet handles the code, so just go Home. */
export default function AuthCallback() {
  return <Redirect href="/" />;
}
