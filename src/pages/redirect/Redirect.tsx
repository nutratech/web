import React from "react";

function Redirect({
  path,
}: {
  path: string;
}) {
  window.location.pathname = path;

  return (
    <>
    </>
  );
}

export default Redirect;
