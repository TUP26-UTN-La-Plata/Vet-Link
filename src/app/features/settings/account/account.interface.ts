export interface UserProfile {
  phones: string[];
  address: string;
  birthDate: string;
}

export const EMPTY_USER_PROFILE: UserProfile = {
  phones: [],
  address: '',
  birthDate: '',
};
