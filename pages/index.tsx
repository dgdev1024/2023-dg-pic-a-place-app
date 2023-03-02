import { useState, FormEvent, ChangeEvent } from "react";

const HomePage = () => {
  const [file, setFile] = useState<File>(null);

  const test = async (ev: FormEvent) => {
    ev.preventDefault();

    if (file) {
      const formData = new FormData();
      formData.append('imageFile', file);

      const res = await fetch('/api/image/upload', {
        method: 'POST',
        // headers: { "Content-Type": "multipart/form-data" },
        body: formData
      });

      const data = await res.json();
      console.log(data);
    }
  };

  const onFileInputChanged = (ev: ChangeEvent<HTMLInputElement>) => {
    const newFile = ev.target.files[0];
    setFile(newFile || null);
  };

  return (
    <>
      <form onSubmit={test}>
        <input
          type="file"
          id="file"
          name="file"
          accept="image/jpeg"
          onChange={onFileInputChanged}
        />
        <button type="submit">Submit</button>
      </form>
    </>
  );
};

export default HomePage;
