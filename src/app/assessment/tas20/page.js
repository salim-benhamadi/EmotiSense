import TAS20Assessment from "./component";
import { cookies } from 'next/headers'


export default async function TAS20Assessmenage() {
  const cookie = await cookies();
  const jwt = cookie.get('token')?.value || '';
  
 return (
  <TAS20Assessment token={jwt} />
 );
}