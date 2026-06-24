export interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  city: string;
  country: string;
  picture: string;
}

export interface RandomUserApiResponse {
  results: RandomUserResult[];
}

export interface RandomUserResult {
  login: {
    uuid: string;
  };
  name: {
    first: string;
    last: string;
  };
  email: string;
  phone: string;
  location: {
    city: string;
    country: string;
    street: {
      number: number;
      name: string;
    };
  };
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  nat: string;
}
