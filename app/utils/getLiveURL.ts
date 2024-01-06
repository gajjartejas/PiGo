const getLiveURL = (serverURLs: string[], controller: AbortController): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const { signal } = controller;
    for (let i = 0; i < serverURLs.length; i++) {
      const timeoutId = setTimeout(() => {
        controller.abort();
        reject();
      }, 2000);
      let url = serverURLs[i];
      fetch(url, { method: 'HEAD', signal })
        .then(response => {
          if (response.ok) {
            resolve(url);
            controller.abort();
            clearTimeout(timeoutId);
          }
        })
        .catch(() => {});
    }
  });
};

export default getLiveURL;
