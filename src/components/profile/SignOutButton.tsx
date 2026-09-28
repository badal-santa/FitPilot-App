import { useNavigation } from "@react-navigation/native";
import { LogOut } from "lucide-react-native";
import { Alert, Pressable, Text } from "react-native";

import { useThemeColors } from "@/constants/colors";
import { signOut } from "@/store/auth-slice";
import { useAppDispatch } from "@/store/hooks";

export default function SignOutButton() {
  const colors = useThemeColors();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const handleSignOut = async () => {
    await dispatch(signOut());
    (navigation.getParent() ?? navigation).reset({
      index: 0,
      routes: [{ name: "Welcome" }],
    });
  };

  return (
    <Pressable
      onPress={() =>
        Alert.alert("Sign Out", "Are you sure you want to sign out?", [
          { text: "Cancel", style: "cancel" },
          { text: "Sign Out", style: "destructive", onPress: handleSignOut },
        ])
      }
      className="mt-6 flex-row items-center justify-center gap-2 rounded-2xl border py-4 active:opacity-70"
      style={{ borderColor: colors.danger }}
    >
      <LogOut size={16} color={colors.danger} />
      <Text className="font-semibold text-sm" style={{ color: colors.danger }}>
        Sign Out
      </Text>
    </Pressable>
  );
}
