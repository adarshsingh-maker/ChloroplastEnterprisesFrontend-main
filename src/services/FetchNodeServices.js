import axios from "axios"

 var serverURL='http://localhost:5000'
const getData=async(url)=>{
 try{
  
      let headers= {}
      const token = localStorage.getItem("TOKEN")
      if (token)
   {
     headers = { headers: {Authorization: `Bearer ${token}`}}
   }

  console.log(`🌐 GET ${serverURL}/${url}`, headers);
  var response=await axios.get(`${serverURL}/${url}`, headers)
  var result=await response.data
  console.log(`✅ GET Response:`, result);
  
  return(result)


}
catch(e)
{
  console.error(`❌ GET Error for ${url}:`, e);
  
  if(e.response && e.response.status == 401)
  {
    console.log('🔒 Unauthorized (401) - clearing session and redirecting');
    localStorage.clear()
    window.location.replace("/gmaillogin")
  }
  
  if(e.response && e.response.status == 403)
  {
    console.log('🚫 Forbidden (403) - clearing session and redirecting');
    localStorage.clear()
    window.location.replace("/gmaillogin")
  }
  
  // Re-throw the error so calling code can handle it
  throw e;

}

}

const postData=async(url,body)=>{
  try{
// alert(localStorage.getItem("TOKEN"))
 let headers= {}
 const token = localStorage.getItem("TOKEN")
 if (token)
{
 headers = { headers: {Authorization: `Bearer ${token}`}}
}
   console.log(`🌐 POST ${serverURL}/${url}`, { body, headers });
   var response=await axios.post(`${serverURL}/${url}`, body, headers)
   var result=await response.data
   console.log(`✅ POST Response:`, result);
   
   return(result)
 

 }
 catch(e)
 {
   console.error(`❌ POST Error for ${url}:`, e);
   
   if(e.response && e.response.status == 401)
   {
     console.log('🔒 Unauthorized (401) - clearing session and redirecting');
     localStorage.clear()
     window.location.replace("/gmaillogin")
   }
   
   if(e.response && e.response.status == 403)
   {
     console.log('🚫 Forbidden (403) - clearing session and redirecting');
     localStorage.clear()
     window.location.replace("/gmaillogin")
   }
   
   // Handle connection errors
   if(e.code === 'ECONNREFUSED' || e.message.includes('Network Error') || !e.response) {
     throw new Error('Unable to connect to server. Please check if the backend is running.');
   }
   
   // Re-throw other errors
   throw e;
 }
 
 }


 export {serverURL,getData,postData}