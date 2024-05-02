
interface I_AuthHeader {
    headers: {
        Authorization : string
    }
};

export const authHeader = (token: string): I_AuthHeader => {
    return {
      headers: {
        Authorization: "Bearer " + token,
      },
    };
   };