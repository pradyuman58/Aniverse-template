
export interface User {
    id: string;
    email: string;
    name: string;
    avatar: string;
}

const USERS_KEY = 'aniverse_users_db';
const SESSION_KEY = 'aniverse_session';

// Simulate delay for realism
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const loginUser = async (email: string, password: string): Promise<User> => {
    await delay(800); // Fake network delay
    const usersStr = localStorage.getItem(USERS_KEY);
    const users = usersStr ? JSON.parse(usersStr) : [];
    
    // In a real app, passwords should be hashed. This is a mock.
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (!user) {
        throw new Error('Invalid email or password');
    }

    const userData = { id: user.id, email: user.email, name: user.name, avatar: user.avatar };
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    return userData;
};

export const registerUser = async (email: string, password: string, name: string): Promise<User> => {
    await delay(800);
    const usersStr = localStorage.getItem(USERS_KEY);
    const users = usersStr ? JSON.parse(usersStr) : [];

    if (users.some((u: any) => u.email === email)) {
        throw new Error('User already exists');
    }

    const newUser = {
        id: Date.now().toString(),
        email,
        password, 
        name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    const userData = { id: newUser.id, email: newUser.email, name: newUser.name, avatar: newUser.avatar };
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    return userData;
};

export const logoutUser = async () => {
    localStorage.removeItem(SESSION_KEY);
};

export const getSession = (): User | null => {
    try {
        const session = localStorage.getItem(SESSION_KEY);
        return session ? JSON.parse(session) : null;
    } catch {
        return null;
    }
};
