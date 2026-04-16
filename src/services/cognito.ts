import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";
import { LOCAL_STORAGE_KEYS } from "../constants";

const poolData = {
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
};

export const userPool = new CognitoUserPool(poolData);

export interface SignInResult {
  cognitoUser: CognitoUser;
  challenge?: 'NEW_PASSWORD_REQUIRED';
}

class CognitoService {
  async signIn(email: string, password: string): Promise<SignInResult> {
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: () => resolve({ cognitoUser }),
        onFailure: reject,
        newPasswordRequired: () => resolve({ cognitoUser, challenge: 'NEW_PASSWORD_REQUIRED' }),
      });
    });
  }

  async completeNewPassword(cognitoUser: CognitoUser, newPassword: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cognitoUser.completeNewPasswordChallenge(newPassword, {}, {
        onSuccess: () => resolve(),
        onFailure: reject,
      });
    });
  }

  signOut(): void {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
      Object.values(LOCAL_STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    }
  }

  async getSession(): Promise<any> {
    const cognitoUser = userPool.getCurrentUser();
    return new Promise((resolve, reject) => {
      if (!cognitoUser) { reject(new Error("No user found")); return; }
      cognitoUser.getSession((err: any, session: any) => {
        if (err) reject(err); else resolve(session);
      });
    });
  }

  getTokenPayload(token: string): any {
    try { return JSON.parse(atob(token.split(".")[1])); } catch { return null; }
  }
}

export const cognitoService = new CognitoService();
