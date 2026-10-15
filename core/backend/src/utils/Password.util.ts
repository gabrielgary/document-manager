import bcrypt from 'bcrypt';
export async function hashPassword(password: string): Promise<string> {
  const password_hash = await bcrypt.hash(password, 10);
  return password_hash;
}
export async function VerifyPassword(
  password_textplain: string,
  password_hash: string,
): Promise<boolean> {
  const is_igual = bcrypt.compare(password_textplain, password_hash);
  return is_igual;
}
