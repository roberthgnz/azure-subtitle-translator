"use client"

import React, { useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

export const FileDropzone = () => {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone();

  useEffect(() => {
    
    const translate = async (file: any) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/translate', {
        method: 'POST',
        body: formData
      });

      return response.json();
    }

    (async () => {
      for await (const file of acceptedFiles) {
      const translated = await translate(file);
      console.log(translated);
    }
    })()

  }, [acceptedFiles]);

  return (
    <section className="border p-8 rounded border-dotted cursor-pointer">
      <div {...getRootProps({ className: 'text-center' })}>
        <input {...getInputProps()} />
        <p>Drag & Drop <br /> or <br /> <span className='text-blue-500'>Click to select files</span></p>
      </div>
    </section>
  );
}
