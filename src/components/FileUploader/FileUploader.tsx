import React, { useRef, useState, useEffect } from 'react';
import { forwardRef, useImperativeHandle } from 'react';
import { Squircle } from '../ultimate-squircle/squircle-js';
import TruncatedText from '../TruncatedText/TruncatedText';

import CancelIcon from '../../assets/Cancel_React.svg'

import styles from "./FileUploader.module.css"

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_TYPES = ['image/', 'application/pdf']; //['image/', 'video/', 'application/pdf']

export type FileUploaderHandle = {
  getFiles: () => File[];
  clearFiles: () => void;
};

type FileUploaderProps = {
  className?: string;
  externalFiles?: File[];
  squircleRef?: React.RefObject<Squircle>;

};

const FileUploader = forwardRef<FileUploaderHandle, FileUploaderProps>(({className, externalFiles, squircleRef}, ref) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const dropRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    getFiles: () => files,
    clearFiles: () => setFiles([]),
  }));

  useEffect(() => {
    if (externalFiles && externalFiles.length > 0) {
      handleFiles([...externalFiles]); // явно передаём File[]
    }
  }, [externalFiles]);

  const handleFiles = (fileList: FileList | File[] | null) => {
    if (!fileList) return;

    const newValidFiles: File[] = [];
    for (let file of Array.from(fileList)) {//Array.from(...) работает как с FileList, так и с File[]
      const isAllowed = ALLOWED_TYPES.some(type => file.type.startsWith(type));
      const isSmallEnough = file.size <= MAX_FILE_SIZE_MB * 1024 * 1024;

      if (!isAllowed) {
        alert(`Файл "${file.name}" не поддерживается`);
        continue;
      }

      if (!isSmallEnough) {
        alert(`Файл "${file.name}" превышает ${MAX_FILE_SIZE_MB}MB`);
        continue;
      }

      if(!files.some(f => f.name === file.name && f.size === file.size) && !newValidFiles.some(f => f.name === file.name && f.size === file.size)){
        newValidFiles.push(file);
      }
    }
    
    if(files.length + newValidFiles.length <= 10){
      setFiles(prev => [...prev, ...newValidFiles]);
    }else{
        const remainingSlots = 10 - files.length; // Сколько файлов еще можно добавить
        if (remainingSlots > 0) {
          setFiles(prev => [...prev, ...newValidFiles.slice(0, remainingSlots)]);
          alert('Можно загружать до 10 файлов. Добавлено только часть файлов.');
        }else{
          alert(`Можно загружать до 10 файлов`);
        }
    }
    // После обновления файлов:
    setTimeout(() => {
      squircleRef?.current?.forceUpdateClipPath();
    }, 0); // через setTimeout, чтобы дождаться рендера
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
    dropRef.current?.classList.remove(`${styles.DragOver}`);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dropRef.current?.classList.add(`${styles.DragOver}`);
  };

  const handleDragLeave = () => {
    dropRef.current?.classList.remove(`${styles.DragOver}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      const res = await fetch('/upload-endpoint', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setUploadProgress(100);
        alert('Загрузка завершена!');
        setFiles([]);
        setUploadProgress(0);
      } else {
        alert('Ошибка при загрузке');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderPreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <img src={URL.createObjectURL(file)} className={styles.FilePreview} alt="" />;
    } else if (file.type.startsWith('video/')) {
      return (
        <video className={styles.FilePreview} controls>
          <source src={URL.createObjectURL(file)} />
        </video>
      );
    } else if (file.type === 'application/pdf') {
      return <p className="text-xs text-gray-500">📄 PDF файл</p>;
    }
    return <p className="text-xs text-gray-500">Неизвестный формат</p>;
  };

  return (
    <div className={`${styles.FileUploaderContainer} ${className}`}>
      <div
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={styles.FileDropChooseZone}
      >
        <div className={styles.UploadElementsContainer}>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className={styles.hiddenInput}
            id="fileInput"
          />
          <Squircle
          topLeftCornerRadius={10}//Левый верхний
          topRightCornerRadius={10}//Правый верхний
          bottomLeftCornerRadius={10}//Левый нижний
          bottomRightCornerRadius={10}//Правый нижний

          cornerSmoothing={1}
          className={styles.fileLabel}

          defaultWidth={130}
          defaultHeight={20}
          >
            <label htmlFor="fileInput" className={styles.fileLabelText}>
              Добавить файлы
            </label>
          </Squircle>

          <p className={styles.HelpMessage}>Перетащи файлы сюда или выбери вручную</p>
        </div>



        {files.length > 0 && (
          <div className={styles.UploadedFilesContainer}>
            <p className={styles.ChoosenFilesLabel}>Выбранные файлы ({files.length}):</p>
            <ul className={styles.UploadedFiles}>
              {files.map((file, index) => (
                <li key={index} className={styles.UploadedFile}>
                  
                  <div className={styles.FileMiniature}>
                    {renderPreview(file)}
                    {/*<button
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                      >
                      Удалить
                    </button>*/}

                    {/*@ts-ignore*/} {/*Временное решение для исправления ошибки (для сборки)*/}
                    <CancelIcon className={styles.CancelButton} width={14} height={14} color="#1A1A1A"
                      onClick={() => handleRemoveFile(index)}
                    />
                  </div>

                  <div className={styles.UploadedFileDescription}>
                    <TruncatedText text={file.name} maxLength={8} AlwaysTrancated={true}></TruncatedText>
                    {/*<p className="text-sm font-medium">{file.name}</p>*/}
                    <p > {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      

      </div>

      {/*<button
        onClick={handleUpload}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Загрузить
      </button>*/}

      {uploadProgress > 0 && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 h-4 rounded">
            <div
              className="bg-green-500 h-4 rounded"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-center mt-1">{uploadProgress}%</p>
        </div>
      )}
    </div>
  );
});

export default FileUploader;
