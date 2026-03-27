export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function mockRegister(payload: RegisterPayload) {
  await delay(900);

  if (!payload.username.trim() || !payload.email.trim() || !payload.password.trim()) {
    throw new Error('All fields are required.');
  }

  if (!payload.email.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  if (payload.password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  return {
    success: true,
    message: 'Registration successful.',
  };
}

export async function mockLogin(payload: LoginPayload) {
  await delay(900);

  if (!payload.email.trim() || !payload.password.trim()) {
    throw new Error('Email and password are required.');
  }

  if (!payload.email.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  if (payload.password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  return {
    success: true,
    user: {
      email: payload.email,
    },
  };
}
