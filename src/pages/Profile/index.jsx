import { useState, useEffect } from 'react';
import axios from 'axios';
import "./profile.css";
import { FaPhoneAlt, FaChevronRight, FaRegEdit, FaChevronUp, FaChevronDown, FaSave } from "react-icons/fa";
import { AiFillMail } from "react-icons/ai";

const Profile = () => {
  const [profileData, setProfileData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [showUserTypeDropdown, setShowUserTypeDropdown] = useState(false);
  const [groups, setGroups] = useState([]);
  const [userTypeOptions, setUserTypeOptions] = useState([
    { label: 'Texnik', value: 'Texnik' },
    { label: 'Plumber', value: 'Plumber' },
    { label: 'Ofis menecer', value: 'Ofis menecer' },
    { label: 'Texnik menecer', value: 'Texnik menecer' }
  ]);
  const [previewImage, setPreviewImage] = useState('');

  const refreshAccessToken = async () => {
    const refresh_token = localStorage.getItem("refresh_token");
    if (!refresh_token) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await axios.post(
        "http://135.181.42.192/accounts/token/refresh/",
        { refresh: refresh_token }
      );
      const { access } = response.data;
      localStorage.setItem("access_token", access);
      axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error; // Rethrow to handle in fetchData
    }
  };

  const fetchData = async () => {
    try {
      await refreshAccessToken(); // Ensure token is refreshed before fetching data

      const [profileResponse, groupsResponse] = await Promise.all([
        axios.get('http://135.181.42.192/accounts/profile/'),
        axios.get('http://135.181.42.192/services/groups/')
      ]);

      setProfileData(profileResponse.data);
      setGroups(groupsResponse.data);
      setPreviewImage(profileResponse.data.profil_picture || ''); // Set initial preview image
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.id]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData({
        ...profileData,
        profil_picture: file
      });
      setPreviewImage(URL.createObjectURL(file)); // Set the preview image
    }
  };

  const handleSelectGroup = (groupId) => {
    const selectedGroup = groups.find(group => group.id === groupId);
    setProfileData({
      ...profileData,
      group: groupId,
      groupName: selectedGroup.group
    });
    setShowGroupDropdown(false);
  };

  const handleSelectUserType = (userType) => {
    setProfileData({
      ...profileData,
      user_type: userType
    });
    setShowUserTypeDropdown(false);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      for (const key in profileData) {
        formData.append(key, profileData[key]);
      }

      await refreshAccessToken(); // Ensure token is refreshed before saving data

      const response = await axios.patch('http://135.181.42.192/accounts/profile_update/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setProfileData(response.data); // Update state with response data
      alert('Profile updated successfully!');
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert('Error updating profile');
    }
  };

  return (
    <div className="profile-container">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="personal-info">
            <div className='profile-edit'>
              <h2>Şəxsi məlumatlar</h2>
              <button onClick={handleEditToggle}>
                {editMode ? (
                  <button onClick={handleSave}>
                    Yadda saxla <FaSave />
                  </button>
                ) : (
                  <button>
                    Profili redaktə et <FaRegEdit />
                  </button>
                )}
              </button>
            </div>
            <div className='profile-table'>
              <div>
                <div className="profile-photo">
                  <img src={previewImage || profileData.profil_picture || ''} alt="Profile" />
                </div>

                <div className='left'>
                  {editMode && (
                    <input type="file" onChange={handleFileChange} />
                  )}
                </div>

                <div className="input-group">
                  <label htmlFor="first_name">Ad</label>
                  <input type="text" id="first_name" value={profileData.first_name} onChange={handleChange} disabled={!editMode} />
                </div>
                <div className="input-group">
                  <label htmlFor="last_name">Soyad</label>
                  <input type="text" id="last_name" value={profileData.last_name} onChange={handleChange} disabled={!editMode} />
                </div>
                <div className="input-group">
                  <label htmlFor="phone">Əlaqə nömrəsi</label>
                  <div>
                    <div>
                      <FaPhoneAlt />
                      <input type="tel" id="phone" value={profileData.phone} onChange={handleChange} disabled={!editMode} />
                    </div>
                    <FaChevronRight />
                  </div>
                </div>
                <div className="input-group">
                  <label htmlFor="email">Mail ünvanı</label>
                  <div>
                    <div>
                      <AiFillMail />
                      <input type="email" id="email" value={profileData.email} onChange={handleChange} disabled={!editMode} />
                    </div>
                    <FaChevronRight />
                  </div>
                </div>
              </div><br />
              <div className="input-group profile-edit-userType-div">
                <label htmlFor="bio">Vəzifə</label>
                {editMode ? (
                  <>
                    <div id="profile-edit-userType" onClick={() => setShowUserTypeDropdown(!showUserTypeDropdown)}>
                      {profileData.user_type || 'Istifadəçi növü seçin'}
                      {showUserTypeDropdown ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                    {showUserTypeDropdown && (
                      <div className="profile-multi-select-dropdown">
                        <label htmlFor="closeUserTypeDropdown">
                          İstifadəçi növü
                          <span className="close-dropdown" id="closeUserTypeDropdown" onClick={() => setShowUserTypeDropdown(false)}>&times;</span>
                        </label>
                        {userTypeOptions.map(option => (
                          <div
                            key={option.value}
                            onClick={() => handleSelectUserType(option.value)}
                            className={profileData.user_type === option.value ? 'selected' : ''}
                          >
                            {option.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <input type="text" id="user_type" value={profileData.user_type || 'İstifadəçi növü daxil edilməyib'} disabled />
                )}
              </div>
            </div>
          </div>
          <div className="address-info">
            <h2>Qrup məlumatları</h2>
            <div>
              <div className="input-group profile-edit-group-div">
                <label htmlFor="group">Qrup</label>
                {editMode ? (
                  <>
                    <div id='profile-edit-group' onClick={() => setShowGroupDropdown(!showGroupDropdown)}>
                      {profileData.groupName || 'Qrup seçin'}
                      {showGroupDropdown ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                    {showGroupDropdown && (
                      <div className="profile-multi-select-dropdown">
                        <label htmlFor="closeGroupsDropdown">
                          Qrup
                          <span className="close-dropdown" id="closeGroupsDropdown" onClick={() => setShowGroupDropdown(false)}>&times;</span>
                        </label>
                        {groups.map(group => (
                          <div
                            key={group.id}
                            onClick={() => handleSelectGroup(group.id)}
                            className={profileData.group === group.id ? 'selected' : ''}
                          >
                            {group.group}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <input type="text" id="group" value={profileData.groupName || 'Qrup daxil edilməyib'} disabled />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
