import React, { useState } from "react";
import NamespaceDeprecationForm from "./NamespaceDeprecationForm";
import NamespaceDeprecationNotice from "./NamespaceDeprecationNotice";


export default ({namespace}) => {
  const [editing, setEditing] = useState(true)

  if (!editing) {
    return <NamespaceDeprecationNotice namespace={namespace} setEditing={() => setEditing(true)}/>
  } else {
    return <NamespaceDeprecationForm namespace={namespace} closeEditing={() => setEditing(false)} />
  }
}