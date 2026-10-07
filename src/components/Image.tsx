import React, {
    ChangeEvent,
    DragEvent,
    useEffect,
    useRef,
    useState
} from 'react';

import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

import './Image.css';


const API_BASE_URL =
    process.env.REACT_APP_API_URL
        ? `${process.env.REACT_APP_API_URL}/api`
        : 'http://localhost:8080/api';


interface NotificationState {
    message: string;
    type: 'success' | 'error';
}


const MAX_FILE_SIZE =
    5 * 1024 * 1024;


const Image: React.FC = () => {
    const navigate =
        useNavigate();

    const fileInputRef =
        useRef<HTMLInputElement | null>(null);


    const token =
        localStorage.getItem('token');


    const [
        image,
        setImage
    ] = useState<string | null>(null);

    const [
        preview,
        setPreview
    ] = useState<string | null>(null);

    const [
        loading,
        setLoading
    ] = useState<boolean>(true);

    const [
        uploading,
        setUploading
    ] = useState<boolean>(false);

    const [
        deleting,
        setDeleting
    ] = useState<boolean>(false);

    const [
        userName,
        setUserName
    ] = useState<string | null>(null);

    const [
        selectedFile,
        setSelectedFile
    ] = useState<File | null>(null);

    const [
        isDragging,
        setIsDragging
    ] = useState<boolean>(false);

    const [
        notification,
        setNotification
    ] = useState<NotificationState | null>(
        null
    );


    /* =====================================================
       NOTIFICATION
       ===================================================== */

    const showNotification = (
        message: string,
        type: 'success' | 'error'
    ) => {
        setNotification({
            message,
            type
        });


        window.setTimeout(() => {
            setNotification(null);
        }, 3500);
    };


    /* =====================================================
       FETCH USERNAME
       ===================================================== */

    useEffect(() => {
        const fetchUserName =
            async () => {
                try {
                    if (!token) {
                        showNotification(
                            'User not logged in.',
                            'error'
                        );

                        setLoading(false);

                        return;
                    }


                    const decodedToken =
                        jwtDecode<{
                            sub: string;
                        }>(token);


                    const email =
                        decodedToken.sub;


                    const response =
                        await axios.get(
                            `${API_BASE_URL}/public/user/get/userName/${email}`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        );


                    setUserName(
                        response.data
                    );

                } catch (err) {

                    console.error(
                        'Error fetching userName:',
                        err
                    );


                    setLoading(false);


                    showNotification(
                        'Failed to load your profile information.',
                        'error'
                    );
                }
            };


        fetchUserName();

    }, [token]);


    /* =====================================================
       FETCH CURRENT IMAGE
       ===================================================== */

    useEffect(() => {
        let currentImageUrl:
            string | null = null;


        const fetchImage =
            async () => {
                if (!userName) {
                    return;
                }


                try {
                    const response =
                        await axios.get(
                            `${API_BASE_URL}/public/user/image/${userName}`,
                            {
                                responseType: 'blob',

                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        );


                    if (
                        response.data &&
                        response.data.size > 0
                    ) {
                        currentImageUrl =
                            URL.createObjectURL(
                                response.data
                            );


                        setImage(
                            currentImageUrl
                        );
                    } else {
                        setImage(null);
                    }

                } catch (err) {

                    /*
                     * A missing image should not block
                     * the upload page.
                     */
                    console.log(
                        'No profile image found:',
                        err
                    );


                    setImage(null);

                } finally {

                    setLoading(false);

                }
            };


        fetchImage();


        return () => {
            if (currentImageUrl) {
                URL.revokeObjectURL(
                    currentImageUrl
                );
            }
        };

    }, [
        userName,
        token
    ]);


    /* =====================================================
       PREVIEW CLEANUP
       ===================================================== */

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(
                    preview
                );
            }
        };
    }, [preview]);


    /* =====================================================
       FILE VALIDATION
       ===================================================== */

    const selectFile = (
        file: File
    ) => {
        if (
            !file.type.startsWith(
                'image/'
            )
        ) {
            showNotification(
                'Please select a valid image file.',
                'error'
            );

            return;
        }


        if (
            file.size > MAX_FILE_SIZE
        ) {
            showNotification(
                'Image size must be less than 5 MB.',
                'error'
            );

            return;
        }


        if (preview) {
            URL.revokeObjectURL(
                preview
            );
        }


        const previewUrl =
            URL.createObjectURL(
                file
            );


        setSelectedFile(file);
        setPreview(previewUrl);
    };


    /* =====================================================
       FILE INPUT
       ===================================================== */

    const handleFileChange = (
        event:
            ChangeEvent<HTMLInputElement>
    ) => {
        const file =
            event.target.files?.[0];


        if (file) {
            selectFile(file);
        }


        event.target.value = '';
    };


    const handleChooseFile = () => {
        fileInputRef.current?.click();
    };


    /* =====================================================
       DRAG & DROP
       ===================================================== */

    const handleDragOver = (
        event: DragEvent<HTMLDivElement>
    ) => {
        event.preventDefault();

        setIsDragging(true);
    };


    const handleDragLeave = (
        event: DragEvent<HTMLDivElement>
    ) => {
        event.preventDefault();

        setIsDragging(false);
    };


    const handleDrop = (
        event: DragEvent<HTMLDivElement>
    ) => {
        event.preventDefault();

        setIsDragging(false);


        const file =
            event.dataTransfer.files?.[0];


        if (file) {
            selectFile(file);
        }
    };


    /* =====================================================
       CANCEL SELECTED FILE
       ===================================================== */

    const handleCancelSelection = () => {
        if (preview) {
            URL.revokeObjectURL(
                preview
            );
        }


        setSelectedFile(null);
        setPreview(null);
    };


    /* =====================================================
       UPLOAD IMAGE
       ===================================================== */

    const handleUpload = async () => {
        if (
            !userName ||
            !selectedFile
        ) {
            showNotification(
                'Please select an image to upload.',
                'error'
            );

            return;
        }


        try {
            setUploading(true);


            const formData =
                new FormData();


            formData.append(
                'file',
                selectedFile
            );


            formData.append(
                'userName',
                userName
            );


            await axios.post(
                `${API_BASE_URL}/public/user/image/upload`,
                formData,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,

                        'Content-Type':
                            'multipart/form-data'
                    }
                }
            );


            /*
             * Use local preview immediately after
             * successful upload instead of reloading
             * the whole React application.
             */
            if (image) {
                URL.revokeObjectURL(
                    image
                );
            }


            if (preview) {
                setImage(preview);
                setPreview(null);
            }


            setSelectedFile(null);


            showNotification(
                'Profile photo updated successfully!',
                'success'
            );

        } catch (err) {

            console.error(
                'Error uploading image:',
                err
            );


            if (
                axios.isAxiosError(err)
            ) {
                showNotification(
                    err.response?.data?.message ||
                    'Failed to upload image. Please try again.',
                    'error'
                );
            } else {
                showNotification(
                    'Failed to upload image. Please try again.',
                    'error'
                );
            }

        } finally {

            setUploading(false);

        }
    };


    /* =====================================================
       DELETE IMAGE
       ===================================================== */

    const handleDeleteImage =
        async () => {
            if (!userName) {
                showNotification(
                    'User not found.',
                    'error'
                );

                return;
            }


            try {
                setDeleting(true);


                await axios.delete(
                    `${API_BASE_URL}/public/user/image/delete/${userName}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


                if (image) {
                    URL.revokeObjectURL(
                        image
                    );
                }


                setImage(null);


                showNotification(
                    'Profile photo deleted successfully!',
                    'success'
                );

            } catch (err) {

                console.error(
                    'Error deleting image:',
                    err
                );


                if (
                    axios.isAxiosError(err)
                ) {
                    showNotification(
                        err.response?.data?.message ||
                        'Failed to delete image.',
                        'error'
                    );
                } else {
                    showNotification(
                        'Failed to delete image.',
                        'error'
                    );
                }

            } finally {

                setDeleting(false);

            }
        };


    /* =====================================================
       FILE SIZE
       ===================================================== */

    const formatFileSize = (
        bytes: number
    ) => {
        if (bytes < 1024) {
            return `${bytes} B`;
        }


        if (
            bytes <
            1024 * 1024
        ) {
            return `${(
                bytes / 1024
            ).toFixed(1)} KB`;
        }


        return `${(
            bytes /
            (1024 * 1024)
        ).toFixed(1)} MB`;
    };


    /* =====================================================
       LOADING
       ===================================================== */

    if (loading) {
        return (
            <div className="profile-image-loading">

                <div className="profile-image-loading-title" />

                <div className="profile-image-loading-content">

                    <div className="profile-image-loading-preview" />

                    <div className="profile-image-loading-upload" />

                </div>

            </div>
        );
    }


    /* =====================================================
       VIEW
       ===================================================== */

    return (
        <div className="profile-image-page">

            {/* =============================================
                HEADER
               ============================================= */}

            <section className="profile-image-header">

                <div>

                    <button
                        type="button"
                        className="profile-image-back"
                        onClick={() =>
                            navigate('/profile')
                        }
                    >
                        <ArrowBackRoundedIcon />

                        Back to profile
                    </button>


                    <span className="profile-image-label">
                        <PhotoCameraRoundedIcon />

                        PROFILE PHOTO
                    </span>


                    <h1>
                        Manage your photo
                    </h1>


                    <p>
                        Add a clear profile photo so
                        people can recognize you across
                        TalkSpace.
                    </p>

                </div>

            </section>


            {/* =============================================
                MAIN GRID
               ============================================= */}

            <div className="profile-image-grid">

                {/* =========================================
                    CURRENT / PREVIEW
                   ========================================= */}

                <section className="profile-image-card">

                    <div className="profile-image-card-heading">

                        <div className="profile-image-heading-icon">
                            <PersonRoundedIcon />
                        </div>


                        <div>

                            <span>
                                PREVIEW
                            </span>


                            <h2>
                                {selectedFile
                                    ? 'New profile photo'
                                    : 'Current profile photo'}
                            </h2>


                            <p>
                                {selectedFile
                                    ? 'This is how your new photo will look.'
                                    : 'Your current TalkSpace profile image.'}
                            </p>

                        </div>

                    </div>


                    <div className="profile-image-preview-area">

                        {preview || image ? (

                            <div className="profile-image-photo-wrapper">

                                <img
                                    src={
                                        preview ||
                                        image ||
                                        ''
                                    }
                                    alt="Profile"
                                    className="profile-image-photo"
                                />


                                {selectedFile && (
                                    <span className="profile-image-new-badge">
                                        New photo
                                    </span>
                                )}

                            </div>

                        ) : (

                            <div className="profile-image-empty">

                                <div className="profile-image-empty-avatar">
                                    <PersonRoundedIcon />
                                </div>


                                <strong>
                                    No profile photo yet
                                </strong>


                                <span>
                                    Upload a photo to
                                    personalize your profile.
                                </span>

                            </div>

                        )}

                    </div>


                    {image && !selectedFile && (
                        <button
                            type="button"
                            className="profile-image-delete"
                            onClick={
                                handleDeleteImage
                            }
                            disabled={
                                deleting
                            }
                        >

                            {deleting ? (
                                <span className="profile-image-spinner danger" />
                            ) : (
                                <DeleteOutlineRoundedIcon />
                            )}


                            {deleting
                                ? 'Deleting...'
                                : 'Delete current photo'}

                        </button>
                    )}

                </section>


                {/* =========================================
                    UPLOAD
                   ========================================= */}

                <section className="profile-image-card">

                    <div className="profile-image-card-heading">

                        <div className="profile-image-heading-icon">
                            <CloudUploadRoundedIcon />
                        </div>


                        <div>

                            <span>
                                UPLOAD
                            </span>


                            <h2>
                                Choose a new photo
                            </h2>


                            <p>
                                JPG, PNG, WEBP or another
                                image format up to 5 MB.
                            </p>

                        </div>

                    </div>


                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={
                            handleFileChange
                        }
                        className="profile-image-file-input"
                    />


                    {!selectedFile ? (

                        <div
                            className={
                                `profile-image-dropzone ${
                                    isDragging
                                        ? 'dragging'
                                        : ''
                                }`
                            }
                            onDragOver={
                                handleDragOver
                            }
                            onDragLeave={
                                handleDragLeave
                            }
                            onDrop={
                                handleDrop
                            }
                            onClick={
                                handleChooseFile
                            }
                            role="button"
                            tabIndex={0}
                            onKeyDown={event => {
                                if (
                                    event.key ===
                                    'Enter' ||
                                    event.key === ' '
                                ) {
                                    handleChooseFile();
                                }
                            }}
                        >

                            <div className="profile-image-upload-icon">
                                <CloudUploadRoundedIcon />
                            </div>


                            <strong>
                                Drop your image here
                            </strong>


                            <span>
                                or click to browse from
                                your device
                            </span>


                            <button
                                type="button"
                                onClick={event => {
                                    event.stopPropagation();

                                    handleChooseFile();
                                }}
                            >
                                <ImageRoundedIcon />

                                Choose image
                            </button>

                        </div>

                    ) : (

                        <div className="profile-image-selected-file">

                            <div className="profile-image-file-icon">
                                <ImageRoundedIcon />
                            </div>


                            <div className="profile-image-file-details">

                                <strong>
                                    {selectedFile.name}
                                </strong>


                                <span>
                                    {formatFileSize(
                                        selectedFile.size
                                    )}
                                </span>

                            </div>


                            <button
                                type="button"
                                className="profile-image-remove-file"
                                onClick={
                                    handleCancelSelection
                                }
                                aria-label="Remove selected image"
                            >
                                <CloseRoundedIcon />
                            </button>

                        </div>

                    )}


                    <div className="profile-image-upload-actions">

                        {selectedFile && (
                            <button
                                type="button"
                                className="profile-image-change-button"
                                onClick={
                                    handleChooseFile
                                }
                                disabled={
                                    uploading
                                }
                            >
                                Choose another
                            </button>
                        )}


                        <button
                            type="button"
                            className="profile-image-upload-button"
                            onClick={
                                handleUpload
                            }
                            disabled={
                                !selectedFile ||
                                uploading
                            }
                        >

                            {uploading ? (
                                <span className="profile-image-spinner" />
                            ) : (
                                <CloudUploadRoundedIcon />
                            )}


                            {uploading
                                ? 'Uploading...'
                                : image
                                    ? 'Update photo'
                                    : 'Upload photo'}

                        </button>

                    </div>

                </section>

            </div>


            {/* =============================================
                TIPS
               ============================================= */}

            <section className="profile-image-tip">

                <div>
                    <AutoAwesomeRoundedIcon />
                </div>


                <p>
                    <strong>
                        Choose a recognizable photo
                    </strong>

                    For the best result, use a clear,
                    well-lit image where your face is
                    visible and centered. Square images
                    work especially well for profile
                    avatars.
                </p>

            </section>


            {/* =============================================
                NOTIFICATION
               ============================================= */}

            {notification && (
                <div
                    className={
                        `profile-image-notification ${notification.type}`
                    }
                >

                    <div className="profile-image-notification-icon">

                        {notification.type ===
                        'success' ? (
                            <CheckCircleRoundedIcon />
                        ) : (
                            <ErrorRoundedIcon />
                        )}

                    </div>


                    <div>

                        <strong>
                            {notification.type ===
                            'success'
                                ? 'Success'
                                : 'Something went wrong'}
                        </strong>


                        <span>
                            {notification.message}
                        </span>

                    </div>

                </div>
            )}

        </div>
    );
};

export default Image;