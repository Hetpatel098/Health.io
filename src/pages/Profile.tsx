
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { User, Settings, Shield, Bell, HelpCircle, LogOut, Upload, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileOptionProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  onClick?: () => void;
}

interface ProfileData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  height: number | null;
  weight: number | null;
  blood_type: string | null;
  age: number | null;
}

const ProfileOption = ({ icon, title, description, onClick }: ProfileOptionProps) => (
  <motion.div 
    className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent cursor-pointer"
    onClick={onClick}
    whileHover={{ x: 5 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div className="flex-1">
      <h3 className="font-medium text-base">{title}</h3>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  </motion.div>
);

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [openProfileEdit, setOpenProfileEdit] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    height: "",
    weight: "",
    blood_type: "",
    age: "",
  });

  // Fetch profile data
  useEffect(() => {
    async function getProfile() {
      try {
        if (!user) return;
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        setProfileData(data);
        setAvatarUrl(data.avatar_url);
        
        // Initialize form data
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          height: data.height?.toString() || "",
          weight: data.weight?.toString() || "",
          blood_type: data.blood_type || "",
          age: data.age?.toString() || "",
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, [user]);

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    try {
      setIsUploading(true);
      const file = event.target.files[0];
      setAvatarFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setAvatarUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      
      // Upload to Supabase
      if (!user) return;
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      
      if (error) throw error;
      
      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    try {
      if (!user) return;
      
      const updates = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        blood_type: formData.blood_type,
        age: formData.age ? parseInt(formData.age) : null,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local state with new profile data
      setProfileData(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      
      setOpenProfileEdit(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Profile" />
      
      <main className="px-5 pt-3 pb-24">
        {/* Profile Header */}
        <motion.section 
          className="mb-8 flex flex-col items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-muted overflow-hidden">
              {avatarUrl ? (
                <img 
                  src={avatarUrl}
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <User className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md cursor-pointer">
              <Camera className="w-4 h-4" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={isUploading}
              />
            </label>
          </div>
          
          <h1 className="text-xl font-medium mt-4">
            {profileData?.first_name} {profileData?.last_name}
          </h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          
          <Button 
            variant="outline" 
            className="mt-4 rounded-full px-6"
            onClick={() => setOpenProfileEdit(true)}
          >
            Edit Profile
          </Button>
        </motion.section>
        
        {/* Health Summary */}
        <motion.section 
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="glass-card p-5">
            <h2 className="text-lg font-medium mb-3">Health Overview</h2>
            
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-sm text-muted-foreground">Height</p>
                <p className="text-lg font-medium">
                  {profileData?.height ? `${profileData.height} cm` : "Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weight</p>
                <p className="text-lg font-medium">
                  {profileData?.weight ? `${profileData.weight} kg` : "Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Blood Type</p>
                <p className="text-lg font-medium">
                  {profileData?.blood_type || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="text-lg font-medium">
                  {profileData?.age ? `${profileData.age} years` : "Not set"}
                </p>
              </div>
            </div>
          </div>
        </motion.section>
        
        {/* Profile Options */}
        <section>
          <h2 className="text-lg font-medium mb-3">Settings</h2>
          
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <ProfileOption 
              icon={<Settings className="w-5 h-5 text-primary" />}
              title="App Settings"
              description="Notification, theme, and app preferences"
            />
            
            <ProfileOption 
              icon={<Shield className="w-5 h-5 text-primary" />}
              title="Privacy Settings"
              description="Manage your data and permissions"
            />
            
            <ProfileOption 
              icon={<Bell className="w-5 h-5 text-primary" />}
              title="Reminders"
              description="Set up health and medication reminders"
            />
            
            <ProfileOption 
              icon={<HelpCircle className="w-5 h-5 text-primary" />}
              title="Help & Support"
              description="FAQs, contact support, and documentation"
            />
            
            <Separator className="my-4" />
            
            <ProfileOption 
              icon={<LogOut className="w-5 h-5 text-destructive" />}
              title="Log Out"
              onClick={handleLogout}
            />
          </motion.div>
        </section>
      </main>
      
      <Dialog open={openProfileEdit} onOpenChange={setOpenProfileEdit}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your personal information here.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bloodType">Blood Type</Label>
                <Input
                  id="bloodType"
                  value={formData.blood_type}
                  onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenProfileEdit(false)}>Cancel</Button>
            <Button onClick={handleProfileUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <BottomNav />
    </div>
  );
};

export default Profile;
