// src/components/Profile/ProfileEditor.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { authService } from '../../services/auth';

export default function ProfileEditor({ user, onUpdate }: { 
    user: any, 
    onUpdate: () => void 
}) {
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant camera roll permissions to update your profile picture.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            try {
                setLoading(true);
                await authService.updateProfile(displayName, result.assets[0].uri);
                onUpdate();
                Alert.alert('Success', 'Profile picture updated successfully');
            } catch (error) {
                Alert.alert('Error', 'Failed to update profile picture');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleUpdateProfile = async () => {
        try {
            setLoading(true);
            await authService.updateProfile(displayName, null);
            onUpdate();
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                {user?.photoURL ? (
                    <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Text style={styles.placeholderText}>
                            {user?.displayName?.charAt(0) || '?'}
                        </Text>
                    </View>
                )}
                <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>

            <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Display Name"
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleUpdateProfile}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Updating...' : 'Update Profile'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 10,
    },
    placeholderImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#2C5530',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    placeholderText: {
        color: '#fff',
        fontSize: 40,
    },
    changePhotoText: {
        color: '#2C5530',
        fontSize: 16,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#2C5530',
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    },
});