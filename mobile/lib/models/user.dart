class User {
  final int id;
  final String email;
  final String name;
  final String role;
  final String? photoUrl;

  User({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    this.photoUrl,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['id'],
        email: json['email'],
        name: json['name'] ?? json['nama'] ?? '',
        role: json['role'] ?? 'VISITOR',
        photoUrl: json['photoUrl'],
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'name': name,
        'role': role,
        'photoUrl': photoUrl,
      };

  bool get isUmkm => role == 'UMKM';
  bool get isAdmin => role == 'ADMIN';
  bool get isVerificator => role == 'VERIFICATOR';
}
