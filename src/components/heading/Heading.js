import logo from '../../assets/logo.png'
import list from '../../assets/list.png'
import { useNavigate } from 'react-router-dom'
export default  function Heading({title,myroute})
{   var navigate=useNavigate()
    return(
        <div style={{ fontFamily:'Caveat', 
            fontWeight:'bold',
            fontSize:30,
            display:'flex',
            //letterSpacing:1,
            
            alignItems:'center',
            flexDirection:'row'}}>
        <img src={logo} width="60"/>
        <div>{title}</div>
        <img src={list} width="40" style={{marginLeft:'auto'}} onClick={()=>navigate(`${myroute}`)}/>
        </div>


    )
}